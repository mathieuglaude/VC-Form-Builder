import { buildApp, setupAppRoutes } from './app';
import { env } from './config';

function log(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [express] ${message}`);
}

(async () => {
  const app = buildApp();
  const server = await setupAppRoutes(app);

  // Use configured port from environment
  const port = parseInt(env.PORT);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();