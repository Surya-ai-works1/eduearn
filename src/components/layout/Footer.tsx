"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight } from "lucide-react";
import { Container } from "./Container";
import { usePathname } from "next/navigation";
import { navigationConfig } from "../../config/navigation";
import { siteConfig } from "../../config/site";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

export function Footer() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [subscribed, setSubsubscribed] = useState(false);
  const [error, setError] = useState("");

  const isDashboard = pathname?.includes("/dashboard");
  if (isDashboard || pathname?.startsWith("/admin")) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email address is required.");
      return;
    }
    
    // basic regex check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubsubscribed(true);
    setEmail("");
  };

  const logoSrc = resolvedTheme === "dark" ? "/logo-light.svg" : "/logo-dark.svg";

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-16 border-t border-slate-200 dark:border-slate-800/80 selection:bg-primary selection:text-white">
      <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-slate-200 dark:border-slate-800/60">
        {/* Brand column */}
        <div className="lg:col-span-4 flex flex-col items-start gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logoSrc}
              alt={siteConfig.name}
              width={112}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed mt-2">
            Learn from Students. Teach Students. Grow Together. India&apos;s AI-Powered Student-to-Student Learning Marketplace.
          </p>
          <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-1 mt-1 text-left">
            <span>Email: support@eduearn.com</span>
            <span>Helpline: +91 11-4500-1200</span>
          </div>
          
          {/* Social Handles */}
          <div className="flex items-center gap-3 mt-4">
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-button bg-slate-200/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-900 transition-all focus:outline-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-button bg-slate-200/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white hover:bg-pink-600 transition-all focus:outline-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-button bg-slate-200/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white hover:bg-blue-700 transition-all focus:outline-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation columns */}
        <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-5 gap-6 text-left">
          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Company
            </h4>
            <ul className="flex flex-col gap-2">
              {navigationConfig.footerNav.company.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Courses
            </h4>
            <ul className="flex flex-col gap-2">
              {navigationConfig.footerNav.courses.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Categories
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li><Link href="/courses?category=academics" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Academic Tuition</Link></li>
              <li><Link href="/courses?category=skills&subject=kuchipudi" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Dance &amp; Choreography</Link></li>
              <li><Link href="/courses?category=skills&subject=keyboard" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Music &amp; Instruments</Link></li>
              <li><Link href="/courses?category=skills&subject=photography" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">DSLR Photography</Link></li>
              <li><Link href="/courses?category=skills&subject=web-development" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Coding &amp; Development</Link></li>
              <li><Link href="/courses?category=ai" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">AI &amp; Innovation</Link></li>
              <li><Link href="/courses?category=academics&subject=english" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Languages Taught</Link></li>
              <li><Link href="/courses?category=skills&subject=cooking" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Cooking Essentials</Link></li>
              <li><Link href="/courses?category=skills&subject=chess" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Chess Strategies</Link></li>
              <li><Link href="/courses?category=skills&subject=drawing" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Drawing &amp; Art</Link></li>
              <li><Link href="/courses?category=skills&subject=public-speaking" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Public Speaking</Link></li>
            </ul>
          </div>

          {/* Tutors */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Tutors
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li><Link href="/tutors?verified=true" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">AI Verified</Link></li>
              {user?.role === "tutor" ? (
                <li><Link href="/tutor/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Tutor Dashboard</Link></li>
              ) : (
                <li><Link href="/become-tutor" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Become a Tutor</Link></li>
              )}
              <li><Link href="/tutor-support" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Payouts FAQ</Link></li>
              <li><Link href="/safety" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Guidelines</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Support
            </h4>
            <ul className="flex flex-col gap-2">
              {navigationConfig.footerNav.support.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter & Download */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Newsletter
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
            Subscribe to our weekly feed for verified course announcements and updates.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl flex items-center px-3.5 py-2 gap-2 hover:border-slate-400 dark:hover:border-slate-700 transition-colors grow">
                <Mail size={14} className="text-slate-500 dark:text-slate-400 shrink-0" />
                <input
                  type="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribed}
                  required
                  className="bg-transparent border-none text-xs text-slate-850 dark:text-slate-200 focus:outline-none placeholder:text-slate-400 w-full"
                />
              </div>
              <button
                type="submit"
                disabled={subscribed}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>{subscribed ? "Subscribed" : "Subscribe"}</span>
                <ArrowRight size={13} />
              </button>
            </div>
            {error && <p className="text-[10px] text-red-500 font-medium px-1">{error}</p>}
            {subscribed && (
              <p className="text-[10px] text-accent font-medium px-1 animate-pulse">
                Successfully subscribed!
              </p>
            )}
          </form>

          {/* App download badges */}
          <div className="flex flex-col gap-2 mt-4">
            <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-650 dark:text-slate-400">
              Download Native App
            </h5>
            <div className="flex items-center gap-2">
              {/* App store badge mockup */}
              <button
                onClick={() => toast.info("Native iOS App is in private beta! Download links will be available here soon.")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-button bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100 select-none transition-all cursor-pointer focus:outline-none">
                <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
                  <path d="M11.6667 9.8787C11.6575 8.1633 13.0642 7.3323 13.1283 7.2956C12.33 6.1362 11.0875 5.9712 10.6567 5.9528C9.625 5.8482 8.64417 6.5587 8.12 6.5587C7.59583 6.5587 6.79583 5.9675 5.92083 5.9839C4.77583 6.0023 3.72583 6.6486 3.13833 7.6661C1.95417 9.7196 2.835 12.7562 3.97833 14.3986C4.53833 15.2014 5.17417 16.0999 6.04917 16.0669C6.89083 16.0321 7.21167 15.5222 8.23083 15.5222C9.25 15.5222 9.54167 16.0669 10.42 16.0486C11.3158 16.0156 11.8758 15.2106 12.43 14.4096C13.0708 13.4837 13.3367 12.5927 13.355 12.5414C13.3183 12.5268 11.685 11.9052 11.6667 9.8787ZM9.7075 3.963C10.1683 3.4079 10.48 2.637 10.3958 1.8735C9.73417 1.9001 8.93417 2.3117 8.46083 2.859C8.05083 3.3293 7.69167 4.1112 7.7925 4.8593C8.52833 4.9161 9.27417 4.4984 9.7075 3.963Z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[7px] text-slate-500 dark:text-slate-450 font-semibold uppercase">Download on the</span>
                  <span className="text-[10px] font-bold mt-0.5">App Store</span>
                </div>
              </button>
 
              {/* Play store badge mockup */}
              <button
                onClick={() => toast.info("Native Android App is in private beta! Download links will be available here soon.")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-button bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100 select-none transition-all cursor-pointer focus:outline-none">
                <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 5.277c0-.986.776-1.523 1.637-1.127l14.155 7.129c.861.396.861 1.042 0 1.438l-14.155 7.129c-.861.396-1.637-.141-1.637-1.127v-13.442z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[7px] text-slate-500 dark:text-slate-450 font-semibold uppercase">Get it on</span>
                  <span className="text-[10px] font-bold mt-0.5">Google Play</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Container>

      {/* Copyright row */}
      <Container className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500 mt-6">
        <p>© {new Date().getFullYear()} EduEarn Ltd. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Terms of Service</Link>
        </div>
      </Container>
    </footer>
  );
}
export default Footer;
