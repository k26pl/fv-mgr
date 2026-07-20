export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { fetchNow } = await import("@/backend/ksef/scheduler");
    fetchNow();
  }
}
