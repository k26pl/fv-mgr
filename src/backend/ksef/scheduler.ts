import { downloadInvoicesSinceLastSync } from "./sync";
import { Timer } from "@/utils/timer";
import { prisma } from "@/backend/db";

const times = (await prisma.syncTimers.findMany()).map((e) => {
  let min = e.hour_min % 100;
  let h = (e.hour_min = min) / 100;
  return [h, min] as [number, number];
});
export enum LastSyncState {
  InProgress,
  Error,
  Ok,
  Uninit,
}
let lastSyncedAt = Date.now();
let lastSyncStatus = LastSyncState.Uninit;
export async function fetchNow() {
  console.log("Fetching invoices");
  lastSyncStatus = LastSyncState.InProgress;
  downloadInvoicesSinceLastSync().then(
    () => {
      lastSyncStatus = LastSyncState.Ok;
      lastSyncedAt = Date.now();
    },
    () => {
      lastSyncStatus = LastSyncState.Error;
      lastSyncedAt = Date.now();
    },
  );
}
const timer = new Timer(times, () => {
  fetchNow();
});

export async function addTime(h: number, m: number) {
  await prisma.syncTimers.create({
    data: {
      hour_min: h * 100 + m,
    },
  });
  times.push([h, m]);
  timer.add_time(h, m);
}

export function getState() {
  return {
    timeSinceMs: Date.now() - lastSyncedAt,
    status: lastSyncStatus,
    times,
  };
}
