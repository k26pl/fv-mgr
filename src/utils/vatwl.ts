export type Result =
  | {
      ok: true;
      name: string;
      nip: string;
      statusVat: string;
      regon: string;
      workingAddress: string;
      accountNumbers: string[];
    }
  | { ok: false; error: string };

// Non-cached, exported for testing
export async function _getFromNip(nip: string): Promise<Result> {
  const d = new Date();

  // if timezones are messed up, this api may return an error about date being in future

  const y = d.getFullYear();
  // getMonth returns a number lowered by 1
  // It was intended to allow ["january","february",...][d.getMonth()]
  // but in cases like this it returns funny numbers
  const m = d.getMonth() + 1;
  const day = d.getDate();

  let res = await fetch(
    `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${y}-${(m + "").padStart(2, "0")}-${(day + "").padStart(2, "0")}`,
  );
  if (!res.ok) {
    // If timezones are not synced, this will ask for previous day, which is the current day for MF
    //If the problem was not time-related this will retry anyway which is still good
    d.setDate(d.getDate() - 1);

    // Chances of someone using this api <=1h from midnight of New Years Eve are low, but never 0
    // Considering functionality of setting schedules, and midnight being common time for them,
    // handling this edge case may actually be important
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();

    res = await fetch(
      `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${y}-${(m + "").padStart(2, "0")}-${(day + "").padStart(2, "0")}`,
    );
  }
  const data = await res.json();
  if (res.ok) {
    if (data.result.subject.statusVat !== "Czynny")
      return {
        ok: false,
        error: "Status VAT nie jest 'Czynny'",
      };
    return {
      ok: true,
      ...data.result.subject,
    };
  } else {
    return {
      ok: false,
      error:
        data && typeof data.code === "string"
          ? data.code
          : "Wystąpił błąd komunikacji z API Ministerstwa Finansów",
    };
  }
}

const SUCCESS_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const ERROR_TTL_MS = 20 * 60 * 1000; // 20 min

interface CacheEntry {
  result: Result;
  expiresAt: number;
}

// persist across requests within the same server instance.
const store = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<Result>>();
export function checkFormat(nip: string) {
  if (nip.length != 10) return false;
  if (!/^\d*$/.test(nip)) return false;
  const d = (i: number) => parseInt(nip[i]);
  const sum =
    d(0) * 6 +
    d(1) * 5 +
    d(2) * 7 +
    d(3) * 2 +
    d(4) * 3 +
    d(5) * 4 +
    d(6) * 5 +
    d(7) * 6 +
    d(8) * 7;
  const cs = sum % 11;
  if (cs == 10) return false;
  const cc = d(9);
  return cc == cs;
}

async function fetchAndStore(nip: string): Promise<Result> {
  try {
    let result: Result;
    if (!checkFormat(nip)) {
      result = {
        ok: false,
        error: "Niepoprawny format",
      };
    } else {
      result = await _getFromNip(nip);
    }

    store.set(nip, {
      result,
      //@TODO: currently errors both as "company no longer/never existed" and "cannot connect to server"
      //       get thrown together into one {ok:false};
      //       on one hand, if server is unavailable, request should be retried
      //       on other hand, they probably wont fix it in a minute,
      //       and if error is caused by ratelimit retrying will
      //       make it even worse
      //
      //       In full-featured production app i'd most likely
      //       1) Add more detailed fields to sort between invalid data and server error
      //       2) a separate cache/queue (redis/nats) and a microservice, so both caches from
      //       all running servers are kept in one place, but also ratelimits are monitored,
      //       and preferably request are spread across few servers
      //
      //       While the api sends correct CORS headers to be accessible from browser,
      //       for security reasons we will want to verify validity on server anyway
      //       and due to browser already having server dns cached and maybe even
      //       a connection in keepalive mode, it may not even be faster.
      //
      //       For this demo, i'll add an option to force a document with nip validation
      //       errors to go thru - most data is going to be synthetic/demo anyway
      expiresAt: Date.now() + (result.ok ? SUCCESS_TTL_MS : ERROR_TTL_MS),
    });
    return result;
  } finally {
    inFlight.delete(nip);
  }
}

// There is high chance that same NIP will be requested multiple times
// e.g. user enters nip manually, it gets verified while user updates rest, then entire document is verified again
//      or just multiple documents from same company are uploaded
export async function cachedGetFromNip(nip: string): Promise<Result> {
  const cached = store.get(nip);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  let promise = inFlight.get(nip);
  if (!promise) {
    promise = fetchAndStore(nip);
    inFlight.set(nip, promise);
  }

  return promise;
}
