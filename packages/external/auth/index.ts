import { AuthClient } from './AuthClient';

// Create a default instance - could use env.AUTH_BASE when needed
export const auth = new AuthClient('');
export { AuthClient };