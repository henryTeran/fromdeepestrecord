export function applyCors(req: any, res: any) {
  const origin = req.headers.origin || "*";
  res.set("Access-Control-Allow-Origin", origin);
  res.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Credentials", "true");
  res.set("Vary", "Origin");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}
