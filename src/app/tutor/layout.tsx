"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TutorProvider, useTutor } from "../../context/TutorContext";
import { RequireTutor } from "../../features/auth/components/RouteGuard";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { TutorSidebar } from "../../components/tutor/Sidebar";
import { TutorHeader } from "../../components/tutor/Header";
import { useAuth } from "../../hooks/useAuth";
import { AiGeneratorModal } from "../../features/ai/components/AiGeneratorModal";

export default function TutorPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isGuestOrOnboarding =
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/onboarding") ||
    pathname.includes("/application-status");

  if (isGuestOrOnboarding) {
    return <>{children}</>;
  }

  return (
    <TutorProvider>
      <TutorPortalLayoutContent>{children}</TutorPortalLayoutContent>
    </TutorProvider>
  );
}

function TutorPortalLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const {
    activeTab,
    handleTabChange,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    pendingAssignments,
    pendingReviewsCount,
    isAiModalOpen,
    setIsAiModalOpen,
    aiModalConfig,
    setAiTokensUsed,
    activeBuilderCourseId,
  } = useTutor();

  const sidebarOffset = isSidebarCollapsed ? "md:ml-[4.5rem]" : "md:ml-64";

  return (
    <RequireTutor>
      <PageWrapper>
        <div className="min-h-screen bg-background flex">
          <TutorSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((p) => !p)}
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            user={user ? { fullName: user.fullName || "Tutor", role: "tutor" } : null}
            onLogout={logout}
            pendingAssignments={pendingAssignments}
            pendingReviews={pendingReviewsCount}
            pendingNotifications={0}
          />

          <div className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 pt-16 ${sidebarOffset}`}>
            <TutorHeader
              activeTab={activeTab}
              isCurriculumBuilderOpen={!!activeBuilderCourseId}
              onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
              onTabChange={handleTabChange}
              notificationCount={pendingAssignments + pendingReviewsCount}
            />

            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>

        <AiGeneratorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          title={aiModalConfig.title}
          promptTemplate={aiModalConfig.template}
          placeholder={aiModalConfig.placeholder}
          onGenerateSuccess={() => {
            setAiTokensUsed((prev) => prev + 1);
          }}
        />
      </PageWrapper>
    </RequireTutor>
  );
}
