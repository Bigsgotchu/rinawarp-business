export async function runAI({ prompt }: any) {
  try {
    const endpoint = process.env.RINA_AI_ENDPOINT;

    if (!endpoint) {
      throw new Error('RINA_AI_ENDPOINT environment variable not set');
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`AI service returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    process.send?.({
      type: 'ai:result',
      data,
    });
  } catch (error) {
    process.send?.({
      type: 'ai:error',
      error: String(error),
    });
  }
}
