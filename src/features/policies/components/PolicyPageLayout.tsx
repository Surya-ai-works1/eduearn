"use client";

import React, { useEffect, useState } from "react";
import { PolicyService, Policy, DEFAULT_SEED_POLICIES } from "../services/policyService";
import { Container } from "@/components/layout/Container";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/card";
import { Scale, Search, ShieldCheck, Clock, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PolicyPageLayoutProps {
  slug: string;
}

export function PolicyPageLayout({ slug }: PolicyPageLayoutProps) {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const allPolicySlugs = Object.keys(DEFAULT_SEED_POLICIES);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await PolicyService.getPolicy(slug);
      setPolicy(data);
      setLoading(false);
    }
    void load();
  }, [slug]);

  // Set page meta details dynamically in client
  useEffect(() => {
    if (policy) {
      document.title = policy.seo_title || `${policy.title} | EduEarn Compliance`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", policy.seo_description || `Read the official EduEarn ${policy.title} and learning platform guidelines.`);
      }
    }
  }, [policy]);

  const filteredSlugs = allPolicySlugs.filter((s) => {
    const item = DEFAULT_SEED_POLICIES[s];
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <PageWrapper>
      <section className="relative min-h-screen py-16 bg-background text-foreground select-none text-left">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.06),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.04),transparent_35%)]"
        />

        <Container className="relative z-10 max-w-7xl">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="text-primary w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-primary">
              EduEarn Legal, Policy &amp; Compliance Center
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-5 border-border bg-card shadow-soft space-y-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search policies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full rounded border border-border bg-background pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Compliance Document Index
                  </h4>
                  <nav className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-1">
                    {filteredSlugs.map((s) => {
                      const item = DEFAULT_SEED_POLICIES[s];
                      const isActive = s === slug;
                      return (
                        <Link
                          key={s}
                          href={`/${s}`}
                          className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-primary text-white"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{item.title}</span>
                          <ChevronRight size={12} className={isActive ? "text-white" : "text-muted-foreground"} />
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </Card>

              <div className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                Need verification or have questions? Email compliance@eduearn.com or contact our helpline.
              </div>
            </div>

            {/* Policy Viewer */}
            <div className="lg:col-span-8">
              <Card className="p-8 border-border bg-card shadow-soft min-h-[500px]">
                {loading ? (
                  <div className="flex h-[400px] w-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : policy ? (
                  <article className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6 mb-6">
                      <div>
                        <h1 id="policy-header" className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
                          {policy.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold text-muted-foreground">
                          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px]">
                            {policy.category} Document
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> Version {policy.version}
                          </span>
                          <span>
                            Effective: {new Date(policy.effective_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-semibold space-y-4">
                      {policy.content.trim()}
                    </div>
                  </article>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <ShieldCheck size={48} className="text-destructive animate-bounce" />
                    <h3 className="mt-4 font-bold text-foreground">Compliance Document Missing</h3>
                    <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                      The policy slug requested could not be resolved. Please try selecting a different policy from the index sidebar.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
