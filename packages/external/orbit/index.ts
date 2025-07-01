import { env } from '../../shared/env';
import { OrbitClient } from './OrbitClient';

export const orbit = new OrbitClient(
  env.ORBIT_BASE_URL ?? 'https://testapi-verifier.nborbit.ca',
  env.ORBIT_API_KEY
);

export { OrbitClient };