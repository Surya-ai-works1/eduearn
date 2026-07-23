import React from "react";
import { ComingSoon } from "../../components/layout/ComingSoon";
import { Cookie } from "lucide-react";

export default function CookiesPage() {
  return (
    <ComingSoon
      title="Cookie Settings & Mappings"
      description="You can customize your browser preference tracking, security tokens, and diagnostic cookie configurations soon."
      icon={<Cookie size={26} />}
    />
  );
}
