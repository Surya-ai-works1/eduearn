"use client";

import React from "react";
import { CollaborativeWhiteboard } from "./CollaborativeWhiteboard";

export function WhiteboardPanel() {
  return (
    <div className="flex-1 h-full w-full p-4 overflow-hidden bg-slate-950 flex flex-col">
      <div className="flex-1 min-h-0">
        <CollaborativeWhiteboard />
      </div>
    </div>
  );
}
