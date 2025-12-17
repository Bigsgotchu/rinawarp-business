export function addCORS(response) {
  const headers = new Headers(response.headers);

  headers.set("Access-Control-Allow-Origin", "https://rinawarptech.com");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  return new Response(response.body, {
    status: response.status,
    headers
  });
}