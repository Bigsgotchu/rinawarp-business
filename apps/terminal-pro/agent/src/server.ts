import net from 'net';
import app from './app.js';

function pickPort(preferred: number): Promise<number> {
  return new Promise<number>((resolve) => {
    const s = net
      .createServer()
      .once('error', () => {
        const s2 = net.createServer();
        s2.listen(0, () => {
          const p = (s2.address() as any).port;
          s2.close(() => resolve(p));
        });
      })
      .once('listening', function (this: net.Server) {
        const p = (this.address() as any).port;
        this.close(() => resolve(p));
      })
      .listen(preferred);
  });
}

const DEFAULT = Number(process.env.PORT) || 3333;
pickPort(DEFAULT).then((PORT) => {
  const server = app.listen(PORT, () => {
    console.log(`🧠 Rina Agent running on http://127.0.0.1:${PORT}`);
  });
  function shutdown(signal: string) {
    console.log(`\n${signal} received. Shutting down…`);
    server.close((err?: Error) => {
      if (err) {
        console.error('HTTP server close error', err);
        process.exit(1);
      }
      process.exit(0);
    });
  }
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
});
