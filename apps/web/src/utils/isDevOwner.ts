// Temporarily disable config import until build system is fixed
// import { featureFlags } from '../../../packages/shared/src/config';

// Treat every form as "owned" when VITE_DEV_OWNER_BYPASS=true
export function isDevOwner(authorId?: number): boolean {
  return import.meta.env.VITE_DEV_OWNER_BYPASS === "true" && !!authorId;
}