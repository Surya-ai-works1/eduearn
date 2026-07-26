import React from "react";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { lmsDb } from "../../../lib/lmsDb";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  coursesList: any[];
  onRemoveItem: (courseId: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  coursesList,
  onRemoveItem,
}) => {
  const router = useRouter();
  
  const wishlistedCourses = coursesList.filter((c) => wishlistIds.includes(c.id));

  const handleEnroll = async (courseId: string, title: string) => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to enroll in this course.");
        router.push("/login");
        return;
      }

      await lmsDb.enrollStudent(user.id, courseId);
      toast.success(`Enrolled in "${title}" successfully!`);
      onRemoveItem(courseId); // Clear from wishlist
      router.push("/student/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to enroll. Try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Wishlist Drawer"
        >
          {/* Backdrop click close */}
          <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

          {/* Drawer content panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-sm bg-card border-l border-border h-full overflow-y-auto p-6 shadow-premium relative z-10 flex flex-col justify-between text-left"
          >
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-sm font-heading font-extrabold text-foreground flex items-center gap-1.5 uppercase">
                  <Heart className="text-red-500 fill-current" size={16} />
                  My Wishlist ({wishlistedCourses.length})
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full cursor-pointer focus:outline-none"
                  aria-label="Close wishlist drawer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Course list */}
              {wishlistedCourses.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground text-xs font-light space-y-2 select-none">
                  <ShoppingBag className="mx-auto text-muted-foreground/30" size={32} />
                  <p>Your wishlist is empty.</p>
                  <button
                    onClick={onClose}
                    className="text-primary font-bold hover:underline"
                  >
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pr-1">
                  {wishlistedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="border border-border bg-muted/20 p-3 rounded-2xl flex gap-3 items-center group"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 aspect-video bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-border flex items-center justify-center">
                        {course.imageSrc ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={course.imageSrc} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="text-slate-700 text-sm" />
                        )}
                      </div>

                      {/* Info & CTA */}
                      <div className="grow min-w-0 space-y-1 text-left">
                        <h4 className="font-heading font-extrabold text-[11px] text-foreground truncate" title={course.title}>
                          {course.title}
                        </h4>
                        <p className="text-[9px] text-muted-foreground truncate">{course.category} • {course.tutorName}</p>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[11px] font-mono font-black text-foreground">
                            {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEnroll(course.id, course.title)}
                              className="px-2.5 py-1 bg-primary text-primary-foreground text-[9px] font-heading font-extrabold uppercase rounded-lg hover:scale-105 transition flex items-center gap-0.5"
                              title="Enroll in this course"
                            >
                              Enroll
                              <ArrowRight size={8} />
                            </button>
                            <button
                              onClick={() => onRemoveItem(course.id)}
                              className="p-1 hover:bg-red-55/10 text-muted-foreground hover:text-red-500 rounded"
                              title="Remove item"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer summary details */}
            {wishlistedCourses.length > 0 && (
              <div className="border-t border-border pt-4 mt-6 select-none space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span>Total price:</span>
                  <span className="text-sm font-heading font-black text-foreground">
                    ₹{wishlistedCourses.reduce((sum, c) => sum + c.price, 0).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    wishlistedCourses.forEach((c) => handleEnroll(c.id, c.title));
                    onClose();
                  }}
                  className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-heading font-extrabold uppercase rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  Enroll in All Courses
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
