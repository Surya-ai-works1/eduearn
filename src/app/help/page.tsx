import React from "react";
import { ComingSoon } from "../../components/layout/ComingSoon";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <ComingSoon
      title="Help Center"
      description="Our knowledge base, search guides, and user manuals are currently being cataloged and will launch soon."
      icon={<HelpCircle size={26} />}
    />
  );
}
