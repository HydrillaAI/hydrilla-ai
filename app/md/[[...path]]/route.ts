type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

export async function GET(_request: Request, _context: RouteContext) {
  return new Response("Not found", { status: 404 });
}
