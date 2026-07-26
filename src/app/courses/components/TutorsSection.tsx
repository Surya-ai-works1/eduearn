import React from "react";
import { Users, BookOpen, Star, ShieldCheck } from "lucide-react";
import { MOCK_TUTORS } from "../../../constants/mockData";
import { motion } from "framer-motion";

export const TutorsSection: React.FC = () => {
  // Take first 4 student tutors from mock data
  const tutors = MOCK_TUTORS.slice(0, 4);

  return (
    <section className="w-full py-12 select-none text-left">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
            Popular Peer Tutors
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Learn from approved campus leaders and top student performers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {tutors.map((tutor) => (
            <motion.div
              key={tutor.id}
              whileHover={{ y: -4 }}
              className="bg-card border border-border/80 shadow-soft rounded-3xl p-5 flex flex-col items-center text-center gap-4 hover:shadow-md transition-all duration-300"
            >
              {/* Profile Image */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/25 bg-slate-900 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tutor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutor.fullName)}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {tutor.verificationStatus === "ai_verified" && (
                  <div className="absolute bottom-0 right-0 p-0.5 bg-emerald-500 text-white rounded-full border border-card">
                    <ShieldCheck size={10} />
                  </div>
                )}
              </div>

              {/* Name & Expertise */}
              <div className="space-y-1">
                <h4 className="font-heading font-extrabold text-xs text-foreground truncate max-w-[150px]" title={tutor.fullName}>
                  {tutor.fullName}
                </h4>
                <span className="text-[9px] bg-muted/65 text-muted-foreground px-2 py-0.5 rounded font-bold uppercase truncate max-w-[155px] inline-block">
                  {tutor.expertise[0] || "Educator"}
                </span>
              </div>

              {/* Bio */}
              <p className="text-[10px] text-muted-foreground font-light line-clamp-2 leading-relaxed h-8">
                {tutor.bio || "EduEarn approved campus mentor sharing practical coding and design guides."}
              </p>

              {/* Stats footer */}
              <div className="w-full border-t border-border/40 pt-4 flex items-center justify-between text-[10px] text-muted-foreground font-medium select-none font-mono">
                <div className="flex items-center gap-0.5">
                  <Star size={11} className="text-yellow-500 fill-current" />
                  <span className="font-bold text-foreground">{(tutor.rating || 4.8).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Users size={11} />
                  <span>{tutor.totalStudents || 120} learners</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <BookOpen size={10} />
                  <span>{tutor.totalCourses || 2} courses</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
