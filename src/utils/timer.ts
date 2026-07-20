function getWarsawTime(): [number, number] {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter
    .format(new Date())
    .split(":")
    .map((e) => parseInt(e, 10)) as [number, number];
}

console.log(getWarsawTime());
function timeTo(hour: number, minute: number) {
  const [ch, cm] = getWarsawTime();

  const nowMinutes = ch * 60 + cm;
  const targetMinutes = hour * 60 + minute;

  // wrap to next day if needed
  const diff =
    (((targetMinutes - nowMinutes) % (24 * 60)) + 24 * 60) % (24 * 60);

  const hr = Math.floor(diff / 60);
  const mr = diff % 60;

  return [hr, mr];
}

export class Timer {
  #interval: number = -1;
  #times: Array<[number, number]>;
  // Prevent starting too quickly
  #fire_debounce = false;
  #callback: () => void;
  constructor(times: Array<[number, number]>, callback: () => void) {
    this.#times = times;
    this.#callback = callback;
    this.schedule();
  }
  schedule() {
    let remaining = this.#times
      .map((e) => {
        let to = timeTo(e[0], e[1]);
        return to[0] * 60 + to[1];
      })
      // by default sort() will convert to string
      // and sort alphabetically giving unexpected results
      .sort((a, b) => a - b);
    if (this.#interval >= 0) {
      clearInterval(this.#interval);
    }
    if (remaining.length > 0) {
      setTimeout(
        () => {
          this.#fire();
        },
        remaining[0] * 60 * 1000,
      );
    }
  }
  #fire() {
    if (this.#fire_debounce) return;
    this.#fire_debounce = true;
    setTimeout(
      () => {
        this.#fire_debounce = false;
        this.schedule();
        // during demo testing we probably wont want to wait
        // too much between pulls
        // as this is calling an api, in prod this should
        // be made configurable and probably increased
        // to avoid ratelimits
      },
      2 * 60 * 1000,
    );
    this.#callback();
  }
  add_time(h: number, m: number) {
    this.#times.push([h, m]);
    this.schedule();
  }
}
