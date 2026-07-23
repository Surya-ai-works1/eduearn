"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * HeroIllustration
 * Renders the user's manually uploaded hero image located at:
 * /images/homepage/hero-main.png
 *
 * Requirements:
 * - Render at its original aspect ratio.
 * - Occupy approximately 90-95% of the hero illustration container (using w-[92%] mx-auto).
 * - Use object-contain.
 * - Keep transparent/white background exactly as in the image.
 * - Gentle floating animation on the outer container.
 */
export function HeroIllustration() {
  return (
    <motion.div
      className="relative w-full select-none"
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Image
        src="/images/homepage/hero-main.png"
        alt="EduEarn — Learn, Teach, Earn marketplace illustration"
        width={900}
        height={800}
        priority
        className="w-full h-auto object-contain"
      />
    </motion.div>
  );
}

export default HeroIllustration;
