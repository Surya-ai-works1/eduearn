"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  collapsed = false,
  className = "",
  onClick,
  href = "/admin/dashboard",
}) => {
  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-black text-sm shadow-soft shrink-0">
        E
      </div>
      {!collapsed && (
        <span className="text-sm font-heading font-black tracking-tight text-foreground uppercase">
          Edu<span className="text-primary">Earn</span>
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className="cursor-pointer block">
      {content}
    </Link>
  );
};
