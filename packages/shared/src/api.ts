export const getProofInitUrl = (
  opts: { formId?: number; real?: boolean }
) => (opts.formId !== undefined && opts.formId !== null)
  ? `/api/proofs/init-form/${opts.formId}`
  : `/api/proofs/init`;  // fallback for publicSlug mode