import { startServer } from './app';

(async () => {
  try {
    await startServer();
  } catch (err) {
    console.error('[INDEX ERROR]', err);
    process.exit(1);
  }
})();
