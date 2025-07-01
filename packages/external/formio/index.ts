import { FormioClient } from './FormioClient';

// Create a default instance - could use env.FORMIO_BASE when needed
export const formio = new FormioClient('');
export { FormioClient };