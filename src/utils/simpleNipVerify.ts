// This is a simple check to make ui respond faster to completly invalid numbers
// If this passes, actual validation will happen on backendby querying government api.

export default function (nip: string) {
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
