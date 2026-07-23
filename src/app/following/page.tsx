"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  Star,
  Users,
  BookOpen,
  ArrowRight,
  Loader2,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";

import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { createClient } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { MOCK_TUTORS, ALL_SUBJECTS } from "../../constants/mockData";

// Helper mappings for mock tutors to valid UUID formats
function getTutorIdFromUuid(uuid: string): string {
  if (uuid.startsWith("00000000-0000-0000-0000-")) {
    const idx = parseInt(uuid.replace("00000000-0000-0000-0000-", ""), 10);
    return `tutor-${idx}`;
  }
  return uuid;
}

interface FollowedTutor {
  id: string; // "tutor-1" or actual database UUID
  dbUuid: string; // actual database UUID
  fullName: string;
  avatar: string | null;
  bio: string;
  category: string;
  rating: number;
  followersCount: number;
  coursesCount: number;
}

export default function FollowingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [tutors, setTutors] = useState<FollowedTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPending, startTransition] = useTransition();

  const loadFollowedTutors = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const supabase = createClient();
      
      // 1. Fetch from database follows table
      const { data: followsData, error: followsErr } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followsErr) throw followsErr;

      const followedIds = (followsData || []).map((f: any) => f.following_id);

      if (followedIds.length === 0) {
        setTutors([]);
        setLoading(false);
        return;
      }

      // 2. Fetch any real profile records for followed UUIDs that are NOT mock IDs
      const realUuids = followedIds.filter((id: string) => !id.startsWith("00000000-0000-0000-0000-"));
      let realProfiles: any[] = [];
      
      if (realUuids.length > 0) {
        const { data: profilesData, error: profilesErr } = await supabase
          .from("profiles")
          .select("*")
          .in("id", realUuids);
        if (!profilesErr && profilesData) {
          realProfiles = profilesData;
        }
      }

      // 3. Map followed IDs to full tutor details (mock + real database profiles)
      const mappedTutors: FollowedTutor[] = followedIds.map((followingId: string) => {
        const mockTutorId = getTutorIdFromUuid(followingId);
        const matchedMock = MOCK_TUTORS.find((t) => t.id === mockTutorId);

        if (matchedMock) {
          // It is a mock tutor
          // Find categories from subjects taught
          const subject = ALL_SUBJECTS.find((s) => matchedMock.subjectsTaughtIds.includes(s.id));
          const category = subject ? subject.category.toUpperCase() : "SKILLS";

          return {
            id: matchedMock.id,
            dbUuid: followingId,
            fullName: matchedMock.fullName,
            avatar: matchedMock.avatar || null,
            bio: matchedMock.bio,
            category,
            rating: matchedMock.rating || 4.8,
            followersCount: matchedMock.rating ? Math.floor(matchedMock.rating * 15) : 48,
            coursesCount: matchedMock.subjectsTaughtIds.length,
          };
        } else {
          // It is a real database tutor profile
          const matchedProfile = realProfiles.find((p) => p.id === followingId);
          return {
            id: followingId,
            dbUuid: followingId,
            fullName: matchedProfile?.full_name || "EduEarn Tutor",
            avatar: matchedProfile?.avatar_url || null,
            bio: matchedProfile?.bio || "Dynamic professional tutor registered on the EduEarn peer marketplace.",
            category: (matchedProfile?.language || "Global").toUpperCase(),
            rating: 5.0,
            followersCount: 1,
            coursesCount: 0,
          };
        }
      });

      setTutors(mappedTutors);
    } catch (err) {
      console.error("Failed to load followed tutors:", err);
      toast.error("Could not load your followed tutors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error("Please login to view followed tutors.");
        router.push("/login?redirect=/following");
      } else {
        loadFollowedTutors();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated, authLoading]);

  // Handle Unfollow Action
  const handleUnfollow = async (tutor: FollowedTutor) => {
    if (!user) return;

    // Optimistic Update
    setTutors((prev) => prev.filter((t) => t.dbUuid !== tutor.dbUuid));
    toast.info(`Unfollowed ${tutor.fullName}`);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", tutor.dbUuid);

      if (error) throw error;
    } catch (err) {
      // Revert if error occurs
      toast.error(`Failed to unfollow ${tutor.fullName}`);
      loadFollowedTutors();
    }
  };

  // Category and Search Filtering
  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "all" ||
      tutor.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter tabs
  const categories = ["all", ...Array.from(new Set(tutors.map((t) => t.category.toLowerCase())))];

  if (authLoading || loading) {
    return (
      <PageWrapper>
        <section className="w-full py-32 bg-background select-none">
          <Container className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-xs text-muted-foreground animate-pulse">Loading followed tutors...</p>
          </Container>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <main className="w-full py-28 lg:py-32 bg-background text-foreground select-none">
        <Container className="max-w-6xl space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight">Following Tutors</h1>
              <p className="text-xs text-muted-foreground">
                Stay updated with learning resources and live class schedules of tutors you follow.
              </p>
            </div>
            <Link href="/tutors">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
                Explore More Tutors
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>

          {tutors.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center py-16 px-6 bg-card border border-border shadow-soft rounded-3xl space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary animate-pulse">
                <Users size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">No tutors followed yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Start following expert educators from the directory to build your custom feed and view dashboard updates.
                </p>
              </div>
              <Link href="/tutors">
                <Button size="sm" className="px-6 py-2.5">
                  Browse Tutors Directory
                </Button>
              </Link>
            </motion.div>
          ) : (
            /* Filter and List Section */
            <div className="space-y-8">
              
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search followed tutors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card border-border/80 text-xs py-2 shadow-sm focus:border-primary/40 rounded-xl"
                  />
                </div>

                {/* Categories Scroll */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1 no-scrollbar justify-start sm:justify-end">
                  <SlidersHorizontal size={14} className="text-muted-foreground mr-1 shrink-0" />
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0 select-none ${
                        selectedCategory === category
                          ? "bg-primary border-primary text-white shadow-soft"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid List */}
              {filteredTutors.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border/60 rounded-2xl">
                  <p className="text-xs text-muted-foreground">No followed tutors matched your active search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredTutors.map((tutor) => (
                      <motion.div
                        key={tutor.dbUuid}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="h-full border border-border/60 hover:border-primary/20 hover:shadow-premium transition-all duration-300 flex flex-col p-5 space-y-4 bg-card rounded-2xl relative group">
                          
                          {/* Top Info */}
                          <div className="flex gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 relative overflow-hidden select-none">
                              {tutor.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={tutor.avatar}
                                  alt={tutor.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                tutor.fullName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <h3 className="font-heading font-extrabold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                {tutor.fullName}
                              </h3>
                              <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider">
                                {tutor.category}
                              </span>
                              
                              {/* Rating & Stats */}
                              <div className="flex items-center gap-2 pt-1">
                                <div className="flex items-center gap-0.5 text-amber-400">
                                  <Star size={11} fill="currentColor" />
                                  <span className="text-[10px] font-bold text-foreground">{tutor.rating.toFixed(1)}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <div className="flex items-center gap-0.5 text-muted-foreground">
                                  <Users size={11} />
                                  <span className="text-[10px] font-semibold text-foreground">{tutor.followersCount} followers</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {tutor.bio}
                          </p>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-2 border-t border-b border-border/30 py-3 text-center shrink-0">
                            <div className="space-y-0.5">
                              <span className="block text-[10px] text-muted-foreground font-medium">Courses</span>
                              <span className="text-xs font-bold text-foreground flex items-center gap-1 justify-center">
                                <BookOpen size={11} className="text-primary" />
                                {tutor.coursesCount}
                              </span>
                            </div>
                            <div className="space-y-0.5 border-l border-border/30">
                              <span className="block text-[10px] text-muted-foreground font-medium">Live Classes</span>
                              <span className="text-xs font-bold text-foreground flex items-center gap-1 justify-center">
                                <ExternalLink size={11} className="text-accent" />
                                Available
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 pt-2 mt-auto">
                            <div className="grid grid-cols-2 gap-2">
                              <Link href={`/tutors/${tutor.id}`} className="w-full">
                                <Button size="sm" variant="outline" className="w-full py-1.5 text-[10px] font-bold">
                                  Profile
                                </Button>
                              </Link>
                              <Link href={`/courses?tutor=${tutor.id}`} className="w-full">
                                <Button size="sm" variant="outline" className="w-full py-1.5 text-[10px] font-bold">
                                  Courses
                                </Button>
                              </Link>
                            </div>
                            <Button
                              onClick={() => handleUnfollow(tutor)}
                              variant="ghost"
                              className="w-full py-1.5 text-[10px] text-destructive hover:bg-destructive/10 font-bold flex items-center justify-center gap-1.5"
                            >
                              <Trash2 size={12} />
                              Unfollow Tutor
                            </Button>
                          </div>

                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

            </div>
          )}

        </Container>
      </main>
    </PageWrapper>
  );
}
