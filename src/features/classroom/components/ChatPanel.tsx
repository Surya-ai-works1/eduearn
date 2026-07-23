"use client";

import React from "react";
import { RealtimeChat } from "./RealtimeChat";
import { useClassroom } from "../context/ClassroomContext";

export function ChatPanel() {
  const { session } = useClassroom();

  if (!session) return null;

  return (
    <div className="flex-1 h-full overflow-hidden">
      <RealtimeChat isTutor={session.isTutor} localName={session.userName} classId={session.id} />
    </div>
  );
}
