export type HealthResponse = {
  status: "ok";
};

export async function fetchSystemHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch system health");
  }
  return (await response.json()) as HealthResponse;
}
