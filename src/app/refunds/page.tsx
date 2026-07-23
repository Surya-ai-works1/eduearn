import React from "react";
import { ComingSoon } from "../../components/layout/ComingSoon";
import { Coins } from "lucide-react";

export default function RefundsPage() {
  return (
    <ComingSoon
      title="Refund & Cancellation Policy"
      description="Peer recorded courses and scheduled live classrooms qualify for our 24-hour refund policies. Detailed rules will launch soon."
      icon={<Coins size={26} />}
    />
  );
}
