import React from "react";
import { ComingSoon } from "../../components/layout/ComingSoon";
import { Newspaper } from "lucide-react";

export default function PressPage() {
  return (
    <ComingSoon
      title="Press & Media Kit"
      description="Check back soon for official press releases, branding assets, logos, and features summaries."
      icon={<Newspaper size={26} />}
    />
  );
}
