import { env } from '../../shared/env';
import { AuthClient } from './AuthClient';

export const auth = new AuthClient(
  env.AUTH_BASE ?? 'https://example-idp.local',
  env.AUTH_API_KEY
);

export { AuthClient };