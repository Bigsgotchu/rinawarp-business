export const onRequestGet = async () => {
  return new Response(JSON.stringify({
    version: "1.0.0",
    date: "2025-12-15",
    notes: "Latest release",
    assets: {
      checksums: {
        "RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage": "some-sha256"
      }
    }
  }), {
    headers: { "content-type": "application/json" }
  });
};
