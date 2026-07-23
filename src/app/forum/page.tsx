import React from "react";
import { ComingSoon } from "../../components/layout/ComingSoon";
import { MessageSquare } from "lucide-react";

export default function ForumPage() {
  return (
    <ComingSoon
      title="Community Forum"
      description="Connect with other learners, discuss math derivations, ask coding queries, and join local peer groups soon."
      icon={<MessageSquare size={26} />}
    />
  );
}
