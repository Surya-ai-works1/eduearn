"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RequireLearner } from '@/features/auth/components/RouteGuard';
import { ArrowLeft, BookOpen, CheckCircle, Circle, Play, Loader2, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completing, setCompleting] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load course details
        const courseRes = await fetch(`/api/student/course/${courseId}`);
        if (!courseRes.ok) {
          throw new Error('Course not found');
        }
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Load enrollment status
        const enrollRes = await fetch(`/api/student/enrollment?courseId=${courseId}`);
        if (!enrollRes.ok) {
          throw new Error('Enrollment check failed');
        }
        const enrollData = await enrollRes.json();
        setEnrollment(enrollData.enrollment);
      } catch (err: any) {
        console.error('Failed to load lesson data', err);
        toast.error('Unable to fetch lesson workspace');
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      loadData();
    }
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <RequireLearner>
        <PageWrapper>
          <div className="flex flex-col items-center justify-center py-40 gap-3 text-muted-foreground">
            <Loader2 size={36} className="animate-spin text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider">Opening classroom...</span>
          </div>
        </PageWrapper>
      </RequireLearner>
    );
  }

  // Access denied state if not enrolled
  if (!enrollment) {
    return (
      <RequireLearner>
        <PageWrapper>
          <section className="w-full py-20">
            <Container>
              <Card variant="glass" className="p-8 max-w-md mx-auto text-center flex flex-col items-center gap-4 shadow-soft">
                <span className="text-3xl">🔒</span>
                <h3 className="text-base font-bold text-foreground">Access Restricted</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You must be enrolled in this course to access the lectures and learning materials.
                </p>
                <div className="flex gap-3 mt-2 w-full">
                  <Button variant="outline" onClick={() => router.push('/student/dashboard')} className="grow font-bold text-xs h-9">
                    Dashboard
                  </Button>
                  <Button onClick={() => router.push(`/courses/${courseId}`)} className="grow font-bold text-xs h-9">
                    View Course Details
                  </Button>
                </div>
              </Card>
            </Container>
          </section>
        </PageWrapper>
      </RequireLearner>
    );
  }

  const lessons = course?.lessons || [];
  const activeLesson = lessons.find((l: any) => l.id === lessonId) || lessons[0];

  if (!activeLesson) {
    return (
      <RequireLearner>
        <PageWrapper>
          <Container>
            <div className="text-center py-20">
              <h3 className="text-base font-bold">Lesson Not Found</h3>
              <p className="text-xs text-muted-foreground mt-1">This lesson does not exist in this course curriculum.</p>
              <Button size="sm" onClick={() => router.push(`/courses/${courseId}`)} className="mt-4 font-bold">
                Go back to details
              </Button>
            </div>
          </Container>
        </PageWrapper>
      </RequireLearner>
    );
  }

  const completedLessons = enrollment?.completedLessons || [];
  const isCompleted = completedLessons.includes(activeLesson.id);

  const handleMarkComplete = async () => {
    if (isCompleted) return;
    try {
      setCompleting(true);
      const res = await fetch(`/api/student/course/${courseId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: activeLesson.id }),
      });

      if (!res.ok) {
        throw new Error('Completion request failed');
      }

      toast.success(`Lesson "${activeLesson.title}" marked as complete!`);
      
      // Update local enrollment state to reflect completion
      setEnrollment((prev: any) => {
        if (!prev) return prev;
        const newCompleted = [...(prev.completedLessons || [])];
        if (!newCompleted.includes(activeLesson.id)) {
          newCompleted.push(activeLesson.id);
        }
        const total = lessons.length || 1;
        const pct = Math.min(100, Math.round((newCompleted.length / total) * 100));
        return {
          ...prev,
          completedLessons: newCompleted,
          progressPercent: pct,
          lastLessonId: activeLesson.id,
        };
      });
    } catch (err) {
      console.error('Failed to complete lesson', err);
      toast.error('Could not save progress');
    } finally {
      setCompleting(false);
    }
  };

  const handleLessonClick = (targetLessonId: string) => {
    router.push(`/student/course/${courseId}/lesson/${targetLessonId}`);
  };

  return (
    <RequireLearner>
      <PageWrapper>
        {/* Workspace header & course progress bar */}
        <section className="w-full border-b border-border/40 py-4 bg-muted/5 select-none">
          <Container className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href={`/courses/${courseId}`}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={13} />
                Back to Course
              </Link>
              <Badge variant="primary" className="text-[10px] uppercase font-bold tracking-wider">
                {course.title}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
              <span>Overall Progress: {enrollment?.progressPercent || enrollment?.progress || 0}%</span>
              <div className="w-24 sm:w-36 h-2 bg-muted rounded-full overflow-hidden border border-border/40">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${enrollment?.progressPercent || enrollment?.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </Container>
        </section>

        {/* Video & Curriculum Columns */}
        <section className="w-full py-8 select-none">
          <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Player & Meta */}
            <div className="lg:col-span-8 flex flex-col gap-6 text-left">
              
              {/* HTML5 Video player */}
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-premium border border-border/40">
                <video 
                  ref={videoRef}
                  src={activeLesson.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                  controls
                  className="w-full h-full"
                  poster={course.thumbnailUrl || '/images/courses/python.webp'}
                />
              </div>

              {/* Lesson details and actions */}
              <div className="flex flex-col gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider">
                      Active Lecture
                    </span>
                    <h1 className="text-xl md:text-2xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
                      {activeLesson.title}
                    </h1>
                  </div>

                  <Button
                    onClick={handleMarkComplete}
                    disabled={isCompleted || completing}
                    variant={isCompleted ? 'success' : 'primary'}
                    size="sm"
                    className="font-bold flex items-center gap-1.5 h-9 shrink-0"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle size={14} className="fill-current text-white" />
                        Completed
                      </>
                    ) : completing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Mark as Complete'
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {activeLesson.description || 'No description provided for this lesson.'}
                </p>
              </div>

              {/* Attachments / Resources */}
              {activeLesson.resources && activeLesson.resources.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-heading font-extrabold text-foreground">
                    Lesson Resources &amp; Downloads
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeLesson.resources.map((res: any, idx: number) => (
                      <Card 
                        key={res.id || idx} 
                        variant="glass" 
                        className="p-4 border border-border/60 bg-card/50 flex items-center justify-between hover:bg-card transition-colors select-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📁</span>
                          <div className="text-left">
                            <h5 className="text-[11px] font-bold text-foreground line-clamp-1">{res.title}</h5>
                            <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-mono">{res.type || 'file'}</span>
                          </div>
                        </div>
                        <a href={res.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="text-[9px] font-bold h-7 px-2">
                            <Download size={11} className="mr-1" />
                            Open
                          </Button>
                        </a>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous & Next Lesson Controls */}
              {(() => {
                const activeIndex = lessons.findIndex((l: any) => l.id === activeLesson.id);
                const prevLesson = activeIndex > 0 ? lessons[activeIndex - 1] : null;
                const nextLesson = activeIndex < lessons.length - 1 ? lessons[activeIndex + 1] : null;

                return (
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/40 mt-4">
                    {prevLesson ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLessonClick(prevLesson.id)}
                        className="flex items-center gap-2 text-xs font-bold"
                      >
                        <ArrowLeft size={13} />
                        Previous: {prevLesson.title}
                      </Button>
                    ) : (
                      <div></div>
                    )}

                    {nextLesson ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleLessonClick(nextLesson.id)}
                        className="flex items-center gap-2 text-xs font-bold"
                      >
                        Next: {nextLesson.title}
                        <ExternalLink size={13} />
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => router.push(`/student/certificate/${courseId}`)}
                        className="flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft"
                      >
                        <CheckCircle size={14} />
                        View Certificate
                      </Button>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Right Column: Syllabus Navigation */}
            <div className="lg:col-span-4 flex flex-col gap-5 text-left lg:sticky lg:top-24">
              <Card variant="default" className="p-0 border border-border bg-card overflow-hidden shadow-floating">
                {/* Header */}
                <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-primary" />
                    <h3 className="text-xs font-bold text-foreground">Course Curriculum</h3>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                    {lessons.length} Lessons
                  </span>
                </div>

                {/* Lessons list */}
                <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/40">
                  {lessons.map((lesson: any, idx: number) => {
                    const isActive = lesson.id === activeLesson.id;
                    const lessonCompleted = completedLessons.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id)}
                        className={`w-full p-4 flex items-start gap-3 transition-colors text-left border-none focus:outline-none cursor-pointer ${
                          isActive 
                            ? 'bg-primary/5 border-l-2 border-primary' 
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {lessonCompleted ? (
                            <CheckCircle size={15} className="text-emerald-500 fill-emerald-500/10" />
                          ) : isActive ? (
                            <Play size={15} className="text-primary fill-primary/20" />
                          ) : (
                            <Circle size={15} className="text-muted-foreground/60" />
                          )}
                        </span>
                        
                        <div className="space-y-0.5 grow">
                          <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${
                            isActive ? 'text-primary' : 'text-foreground'
                          }`}>
                            {idx + 1}. {lesson.title}
                          </h4>
                          <span className="text-[9px] text-muted-foreground block font-medium">
                            {lesson.duration ? `${lesson.duration} mins` : '10 mins'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

          </Container>
        </section>
      </PageWrapper>
    </RequireLearner>
  );
}
