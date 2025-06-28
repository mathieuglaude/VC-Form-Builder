import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  className?: string;
}

export default function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-green-100 text-green-800 hover:bg-green-100 animate-pulse ${className}`}
    >
      <ShieldCheck className="w-3 h-3 mr-1" />
      Verified
    </Badge>
  );
}
