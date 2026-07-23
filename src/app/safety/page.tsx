import React from "react";
import { ComingSoon } from "../../components/layout/ComingSoon";
import { ShieldCheck } from "lucide-react";

export default function SafetyPage() {
  return (
    <ComingSoon
      title="Safety & Trust Guidelines"
      description="Peer-to-peer security rules, moderator reviews, and safe live classroom guidelines are currently being compiled."
      icon={<ShieldCheck size={26} />}
    />
  );
}
