"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { BookOpen, Award, ArrowRight, Sparkles } from "lucide-react";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

export default function ChooseRolePage() {
  const { chooseRole, user } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"learner" | "tutor" | null>(
    (user?.role === "student" || user?.role === "tutor")
      ? (user.role === "student" ? "learner" : "tutor")
      : null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "tutor") {
      router.replace("/tutor/onboarding");
      return;
    }
    if (typeof window !== "undefined") {
      const pendingRole = localStorage.getItem("onboarding_role");
      if (pendingRole === "tutor") {
        setIsLoading(true);
        chooseRole("tutor").then((success) => {
          setIsLoading(false);
          if (success) {
            router.replace("/tutor/onboarding");
          }
        });
      }
    }
  }, [user, chooseRole, router]);

  const handleSelectRole = async () => {
    if (!selectedRole) {
      toast.error("Please choose a role before proceeding.");
      return;
    }

    setIsLoading(true);
    const success = await chooseRole(selectedRole === "learner" ? "student" : "tutor");
    setIsLoading(false);

    if (success) {
      toast.success(`Role selected: ${selectedRole.toUpperCase()}`);
      router.push("/complete-profile");
    } else {
      toast.error("Failed to save your role selection.");
    }
  };

  return (
    <PageWrapper>
      <section className="w-full py-16 select-none text-left min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        {/* Background gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.1),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.06),transparent_32%)]"
        />

        <Container className="max-w-2xl relative z-10">
          <Card variant="glass" hoverEffect="none" className="p-8 shadow-floating text-center">
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles size={13} aria-hidden="true" />
                Role Onboarding
              </span>
              <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight mt-2">
                Select Your Role
              </h1>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Choose how you would like to use EduEarn. This configuration determines your default dashboard modules.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {/* Learner Card */}
              <motion.div
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => setSelectedRole("learner")}
                className={`p-6 border rounded-card cursor-pointer flex flex-col gap-4 items-center justify-center text-center transition-all duration-300 ${
                  selectedRole === "learner"
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-soft scale-[1.02]"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-heading font-extrabold text-foreground">
                    I want to Learn
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Access peer course catalogs, enroll in clearance lectures, and earn certificates.
                  </p>
                </div>
              </motion.div>

              {/* Tutor Card */}
              <motion.div
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => setSelectedRole("tutor")}
                className={`p-6 border rounded-card cursor-pointer flex flex-col gap-4 items-center justify-center text-center transition-all duration-300 ${
                  selectedRole === "tutor"
                    ? "border-accent bg-accent/5 ring-1 ring-accent shadow-soft scale-[1.02]"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-heading font-extrabold text-foreground">
                    I want to Teach
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Host clearance live rooms, publish subject catalogs, and transfer earnings to UPI.
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                onClick={handleSelectRole}
                disabled={isLoading || !selectedRole}
                className="w-full mt-8 flex items-center justify-center gap-1.5 shadow-premium"
              >
                {isLoading ? "Saving role selection..." : "Confirm & Proceed"}
                <ArrowRight size={14} />
              </Button>
            </motion.div>

          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
