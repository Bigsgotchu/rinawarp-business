export default {
  async fetch(request) {
    const target =
      'https://ba2f14cefa19dbdc42ff88d772410689.r2.cloudflarestorage.com/rinawarp-downloads/terminal-pro/0.9.0/RinaWarp-Terminal-Pro-Linux.AppImage';
    const res = await fetch(target);

    return new Response(
      `R2 Response Status: ${res.status}\n\nHeaders:\n${JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2)}\n\nBody:\n${await res.text()}`,
      {
        status: res.status,
        headers: { 'Content-Type': 'text/plain' },
      },
    );
  },
};
