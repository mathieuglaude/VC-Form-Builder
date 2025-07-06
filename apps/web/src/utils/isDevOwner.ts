// Treat every form as "owned" when VITE_DEV_OWNER_BYPASS=true
export function isDevOwner(authorId?: number): boolean {
  return import.meta.env.VITE_DEV_OWNER_BYPASS === "true" && !!authorId;
}