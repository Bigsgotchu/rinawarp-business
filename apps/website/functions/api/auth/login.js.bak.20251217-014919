export async function onRequestPost(context) {
    return new Response(
        JSON.stringify({ error: "AUTH_SERVICE_IN_MAINTENANCE" }),
        { status: 503, headers: { "content-type": "application/json" } }
    );
}
