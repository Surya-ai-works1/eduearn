"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RequireLearner } from '@/features/auth/components/RouteGuard';
import { BookOpen, Play, CheckCircle, Clock, BookOpenCheck, ArrowLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MyLearningPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const res = await fetch('/api/student/enrollment');
        if (!res.ok) {
          throw new Error('Failed to load enrollments');
        }
        const data = await res.json();
        setEnrollments(data.enrollments || []);
      } catch (err: any) {
        console.error('Failed to load learning enrollments', err);
        toast.error('Unable to fetch enrolled courses');
      } finally {
        setLoading(false);
      }
    }
    loadEnrollments();
  }, []);

  const handleResume = (enrollment: any) => {
    const courseId = enrollment.courseId;
    const lessons = enrollment.course?.lessons || [];
    
    // Find the next uncompleted lesson or default to the first one
    const completed = enrollment.completedLessons || [];
    const lastLessonId = enrollment.lastLessonId;

    let targetLessonId = '';
    
    if (lastLessonId && lessons.some((l: any) => l.id === lastLessonId)) {
      // Resume the last accessed lesson
      targetLessonId = lastLessonId;
    } else {
      // Find the first uncompleted lesson
      const nextUncompleted = lessons.find((l: any) => !completed.includes(l.id));
      targetLessonId = nextUncompleted ? nextUncompleted.id : (lessons[0]?.id || '');
    }

    if (!targetLessonId) {
      toast.error('No lessons available for this course yet.');
      return;
    }

    router.push(`/student/course/${courseId}/lesson/${targetLessonId}`);
  };

  return (
    <RequireLearner>
      <PageWrapper>
        <section className="w-full py-10 bg-muted/10 border-b border-border/40 select-none">
          <Container className="flex flex-col gap-3 text-left">
            <Link 
              href="/student/dashboard" 
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors w-fit"
            >
              <ArrowLeft size={13} />
              Back to Dashboard
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground tracking-tight">
                  My Learning Portal
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 max-w-lg leading-relaxed">
                  Access your active courses, check your lessons checklist, and pick up right where you left off.
                </p>
              </div>
              <Button size="sm" onClick={() => router.push('/courses')} className="flex items-center gap-1.5 font-bold">
                Find More Courses
                <ArrowUpRight size={13} />
              </Button>
            </div>
          </Container>
        </section>

        <section className="w-full py-12 select-none min-h-[50vh]">
          <Container>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 size={36} className="animate-spin text-primary" />
                <span className="text-xs font-mono uppercase tracking-wider">Loading enrolled courses...</span>
              </div>
            ) : enrollments.length === 0 ? (
              <Card variant="glass" className="p-10 border-dashed border-2 border-border/80 bg-card max-w-xl mx-auto text-center flex flex-col items-center gap-4 shadow-soft">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                  📚
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">No Enrolled Courses Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    {"You haven't enrolled in any courses yet. Browse the student marketplace to start your learning journey!"}
                  </p>
                </div>
                <Button size="sm" onClick={() => router.push('/courses')} className="mt-2 font-bold">
                  Browse Course Catalog
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((item) => {
                  const course = item.course || {};
                  const totalLessons = course.lessons?.length || 5;
                  const completedCount = item.completedLessons?.length || 0;

                  return (
                    <Card 
                      key={item.id} 
                      variant="glass" 
                      className="p-0 border border-border bg-card overflow-hidden flex flex-col justify-between hover:shadow-floating transition-shadow duration-300 group"
                    >
                      {/* Thumbnail Header */}
                      <div className="relative w-full aspect-video bg-muted border-b border-border/60 overflow-hidden shrink-0">
                        <img 
                          src={course.thumbnailUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=course'} 
                          alt={course.title || 'Course'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleResume(item)}
                            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          >
                            <Play size={16} className="fill-current ml-0.5" />
                          </button>
                        </div>
                        <Badge 
                          variant="primary" 
                          className="absolute top-3 left-3 capitalize text-[9px] py-0.5 px-2"
                        >
                          {course.category || 'General'}
                        </Badge>
                      </div>

                      {/* Info Body */}
                      <div className="p-5 flex flex-col gap-4 grow text-left">
                        <div className="space-y-1">
                          <Link href={`/courses/${item.courseId}`}>
                            <h3 className="text-sm font-heading font-extrabold text-foreground hover:text-primary transition-colors line-clamp-1">
                              {course.title || 'Course Title'}
                            </h3>
                          </Link>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            By {course.instructor || 'Tutor Instructor'}
                          </span>
                        </div>

                        {/* Progress Tracker */}
                        <div className="space-y-2 mt-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpenCheck size={12} className="text-primary" />
                              {completedCount} / {totalLessons} Lessons
                            </span>
                            <span className={item.progressPercent >= 100 ? "text-emerald-500 font-extrabold" : "text-foreground font-extrabold"}>
                              {item.progressPercent}% Completed
                            </span>
                          </div>
                          
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/20">
                            <div 
                              className={`h-full transition-all duration-550 ${
                                item.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-primary'
                              }`} 
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="flex items-center gap-2.5 pt-2 mt-auto border-t border-border/40">
                          <Button 
                            onClick={() => handleResume(item)} 
                            size="sm" 
                            className="grow font-bold text-xs flex items-center justify-center gap-1.5 h-9"
                          >
                            <Play size={13} className="fill-current ml-0.5" />
                            {item.progressPercent >= 100 ? 'Review Lessons' : 'Resume Learning'}
                          </Button>
                          <Link href={`/courses/${item.courseId}`} className="shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs font-bold h-9 px-3"
                              title="View Curriculum"
                            >
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Container>
        </section>
      </PageWrapper>
    </RequireLearner>
  );
}
