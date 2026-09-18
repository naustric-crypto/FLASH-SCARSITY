export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return Response.json({
    ok: true,
    service: "flash-scarcity",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
  });
}
