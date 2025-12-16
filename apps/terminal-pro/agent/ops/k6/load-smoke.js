import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  vus: __ENV.VUS ? Number(__ENV.VUS) : 5,
  duration: __ENV.DURATION || '30s',
  thresholds: { http_req_duration: ['p(95)<400'] },
};
const BASE = __ENV.BASE || 'http://127.0.0.1:3333';
export default function () {
  const health = http.get(`${BASE}/health`);
  check(health, { 'health 200': (r) => r.status === 200 });
  const payload = JSON.stringify({
    model: 'rina-agent',
    messages: [{ role: 'user', content: 'hello' }],
  });
  const headers = { 'Content-Type': 'application/json' };
  const chat = http.post(`${BASE}/v1/chat/completions`, payload, { headers });
  check(chat, { 'chat 200': (r) => r.status === 200 });
  sleep(1);
}
