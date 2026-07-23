"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, User as UserIcon } from "lucide-react";
import { cn } from "../../utils/cn";

export interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline" | "none";
  badge?: "verified" | "tutor" | "student" | "none";
  className?: string;
}

export function Avatar({
  src,
  name,
  size = "md",
  status = "none",
  badge = "none",
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Reset imageError whenever src changes — critical for avatar upload refresh.
  // Without this, a previously failed load keeps imageError=true and the new
  // URL is never attempted, so initials keep showing after upload.
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();


  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  };

  const statusColor = status === "online" ? "bg-accent" : "bg-slate-400";

  return (
    <div className={cn("relative shrink-0 select-none", className)}>
      <div
        className={cn(
          "rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary overflow-hidden",
          sizeClasses[size]
        )}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={name}
            width={64}
            height={64}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials || <UserIcon size={size === "sm" ? 14 : size === "md" ? 18 : 22} />}</span>
        )}
      </div>

      {/* Online/Offline status indicator */}
      {status !== "none" && (
        <span
          className={cn(
            "absolute border-2 border-card rounded-full",
            statusColor,
            {
              "w-2.5 h-2.5 bottom-0 right-0": size === "sm",
              "w-3.5 h-3.5 bottom-0.5 right-0.5": size === "md",
              "w-4 h-4 bottom-1 right-1": size === "lg",
            }
          )}
          role="status"
          aria-label={status === "online" ? "Online" : "Offline"}
        />
      )}

      {/* Mini verified badge icon */}
      {badge !== "none" && (
        <span
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full flex items-center justify-center text-white border-2 border-card",
            {
              "bg-accent": badge === "verified",
              "bg-primary": badge === "tutor",
              "bg-purple-600": badge === "student",
              
              "w-4.5 h-4.5 text-[8px]": size === "sm",
              "w-5.5 h-5.5 text-[10px]": size === "md",
              "w-6.5 h-6.5 text-[11px]": size === "lg",
            }
          )}
        >
          {badge === "verified" ? (
            <Check className="w-2.5 h-2.5" strokeWidth={3} />
          ) : badge === "tutor" ? (
            <Check className="w-2.5 h-2.5" strokeWidth={3} />
          ) : (
            <Check className="w-2.5 h-2.5" strokeWidth={3} />
          )}
        </span>
      )}
    </div>
  );
}
export default Avatar;
