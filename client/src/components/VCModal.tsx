import { useEffect, useState } from 'react';

export default function VCModal({
  reqId,
  qr,
  onVerified
}: {
  reqId: string;
  qr: string;
  onVerified: (attributes: any) => void;
}) {
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`/api/proofs/${reqId}`).then(r => r.json());
        setStatus(r.status);
        if (r.status === 'presentation_verified') {
          clearInterval(iv);
          onVerified(r.attributes);
        }
      } catch (error) {
        console.error('Error polling proof status:', error);
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [reqId, onVerified]);

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/50">
      <div className="bg-white p-6 rounded">
        {status === 'pending' && (
          <>
            <p className="mb-4">Scan with your wallet:</p>
            <img src={`data:image/png;base64,${qr}`} className="w-56 h-56" alt="proof QR"/>
          </>
        )}
        {status === 'presentation_verified' && <p className="text-green-600">Verified ✔</p>}
      </div>
    </div>
  );
}