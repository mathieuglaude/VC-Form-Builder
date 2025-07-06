import { useQuery, useMutation } from '@tanstack/react-query';

// 1️⃣ Credential library
export function useCredentialLibrary() {
  return useQuery({
    queryKey: ['/api/cred-lib'],
    staleTime: 60 * 60_000
  });
}

// 2️⃣ Forms list  
export function useForms() {
  return useQuery({
    queryKey: ['/api/forms'],
    refetchInterval: 60_000 // Re-validate every minute so "Updated last" moves cards
  });
}

// 3️⃣ Proof request (returns QR PNG + reqId) - simplified for now
export function useProof(defId: string) {
  return useQuery({
    queryKey: ['proof', defId],
    queryFn: () => fetch(`/api/proofs/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defId })
    }).then(r => r.json()),
    staleTime: 5 * 60_000,
    enabled: Boolean(defId)
  });
}

// 4️⃣ Proof status (poll every 3 s)
export function useProofStatus(reqId: string) {
  return useQuery({
    queryKey: ['proof-status', reqId],
    queryFn: () => fetch(`/api/proofs/${reqId}`).then(r => r.json()),
    refetchInterval: 3_000,
    enabled: Boolean(reqId)
  });
}