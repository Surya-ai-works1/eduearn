"use client";

import React from "react";
import Link from "next/link";
import { cn } from "../../utils/cn";

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
    <div className={`flex items-center select-none ${className}`}>
      <div className={cn(
        "relative shrink-0 overflow-hidden",
        collapsed ? "w-8 h-8 rounded-lg" : "w-[112px] h-[32px]"
      )}>
        <img
          src="/logo-dark.svg"
          alt="EduEarn"
          className="w-[112px] h-[32px] block dark:hidden"
          style={{ objectPosition: "left", objectFit: "cover" }}
        />
        <img
          src="/logo-light.svg"
          alt="EduEarn"
          className="w-[112px] h-[32px] hidden dark:block"
          style={{ objectPosition: "left", objectFit: "cover" }}
        />
      </div>
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
