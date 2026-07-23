import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

/**
 * Shared routing helper to navigate to the Live Classroom.
 */
export function navigateToClassroom(router: AppRouterInstance, sessionId: string) {
  if (!sessionId) {
    toast.error("Invalid session ID. Cannot join classroom.");
    return;
  }
  toast.info(`Entering classroom for session ${sessionId}...`);
  router.push(`/classroom/${sessionId}`);
}
