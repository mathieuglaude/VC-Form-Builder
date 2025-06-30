import { useEffect, useState } from 'react';

export default function VCModal({
  txId,
  qr,
  onVerified
}: {
  txId: string;
  qr: string;
  onVerified: () => void;
}) {
  const [state, setState] = useState('pending');

  useEffect(() => {
    const iv = setInterval(async () => {
      const r = await fetch(`/api/proofs/${txId}`).then(r => r.json());
      setState(r.state);
      if (r.state === 'verified') {
        clearInterval(iv);
        onVerified();
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [txId, onVerified]);

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/50">
      <div className="bg-white p-6 rounded">
        {state === 'pending' && (
          <>
            <p className="mb-4">Scan with your wallet:</p>
            <img src={qr} alt="proof QR" className="w-48 h-48" />
          </>
        )}
        {state === 'verified' && <p className="text-green-600">Verified ✔</p>}
      </div>
    </div>
  );
}