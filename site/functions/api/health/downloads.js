export const onRequestGet = async () => {
  return new Response(JSON.stringify({
    ok: true,
    results: [
      { name: "download1", ok: true },
      { name: "download2", ok: true }
    ]
  }), {
    headers: { "content-type": "application/json" }
  });
};
