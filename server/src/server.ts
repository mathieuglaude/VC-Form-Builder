import { buildApp, setupAppRoutes } from './app';
import './boot/ensureLawyerCred';
import { log } from '../vite';
import { env } from './config';

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