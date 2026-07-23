import React from "react";
import { ComingSoon } from "../../components/layout/ComingSoon";
import { Briefcase } from "lucide-react";

export default function CareersPage() {
  return (
    <ComingSoon
      title="Careers at EduEarn"
      description="We are building the future of peer-to-peer student learning. Our job openings and internship programs will launch soon."
      icon={<Briefcase size={26} />}
    />
  );
}
