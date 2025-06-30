import { buildApp, setupAppRoutes } from './app';
import './boot/ensureLawyerCred';
import { log } from '../vite';

(async () => {
  const app = buildApp();
  const server = await setupAppRoutes(app);

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();