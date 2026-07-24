"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Loader2 } from "lucide-react";

export default function BecomeTutorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tutor/onboarding");
  }, [router]);

  return (
    <PageWrapper>
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </PageWrapper>
  );
}
