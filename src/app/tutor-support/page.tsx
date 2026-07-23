import React from "react";
import { ComingSoon } from "../../components/layout/ComingSoon";
import { Headphones } from "lucide-react";

export default function TutorSupportPage() {
  return (
    <ComingSoon
      title="Tutor Support Services"
      description="Help articles for payout requests, live virtual class bandwidth queries, and profile verifications will launch soon."
      icon={<Headphones size={26} />}
    />
  );
}
