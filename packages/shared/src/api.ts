export const getProofInitUrl = (
  opts: { formId?: number; real?: boolean }
) => opts.real && opts.formId
  ? `/api/proofs/init-form/${opts.formId}`
  : `/api/proofs/init`;