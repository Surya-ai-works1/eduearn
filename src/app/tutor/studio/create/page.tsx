"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../hooks/useAuth";
import { lmsDb } from "../../../../lib/lmsDb";
import { createClient } from "../../../../lib/supabase";
import { toast } from "sonner";
import { FaArrowLeft, FaGraduationCap, FaCloudUploadAlt } from "react-icons/fa";
import { MarketplaceService } from "../../../../features/payments/services/marketplaceService";

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Form states
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [level, setLevel] = useState("Beginner");
  const [price, setPrice] = useState("999");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [levelsList, setLevelsList] = useState<string[]>([]);

  useEffect(() => {
    // Dynamic fetch from single source of truth
    const cats = MarketplaceService.getCategories().filter(c => c.status === "Enabled").map(c => c.name);
    setCategoriesList(cats.length > 0 ? cats : [
      "App Development",
      "AI/ML",
      "AI Tools",
      "Data Science",
      "Data Analytics",
      "Ethical Hacking",
      "UI UX Designing",
      "Web Development",
      "Others"
    ]);

    const lvls = MarketplaceService.getLevels();
    setLevelsList(lvls);
    if (lvls.length > 0 && !lvls.includes(level)) {
      setLevel(lvls[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- level check is for initial mount validation only
  }, []);

  useEffect(() => {
    let calculatedPrice = "999";
    if (level === "Intermediate") calculatedPrice = "1299";
    if (level === "Advanced") calculatedPrice = "1499";
    if (category === "AI/ML" || category === "AI Tools") calculatedPrice = "1999";
    setPrice(calculatedPrice);
  }, [category, level]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    try {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Thumbnail file size must be less than 2MB");
        throw new Error("File size limit exceeded");
      }

      const allowedExts = ["jpg", "jpeg", "png", "webp", "gif"];
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (!fileExt || !allowedExts.includes(fileExt)) {
        toast.error("Invalid image format. Allowed: JPG, PNG, WEBP, GIF");
        throw new Error("Invalid file extension");
      }

      const supabase = createClient();
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr || !refreshData.session) {
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          throw new Error("Session expired");
        }
      }

      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from("course-thumbnails")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (e) {
      console.warn("Storage upload failed, falling back to base64 preview:", e);
      return thumbnailPreview; // fallback to base64
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    
    // Authoritative session check before protected database insert operation
    let activeSession = null;
    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr || !refreshData.session) {
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }
        activeSession = refreshData.session;
      } else {
        activeSession = session;
      }
    } catch {
      toast.error("Authentication check failed.");
      return;
    }

    if (!activeSession) return;

    if (!title.trim() || !category || !level) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      let thumbnailUrl = "";
      if (thumbnailFile) {
        thumbnailUrl = await uploadFileToSupabase(thumbnailFile);
      }

      await lmsDb.createCourse(activeSession.user.id, {
        title,
        subtitle: subTitle,
        description,
        category,
        level,
        thumbnail: thumbnailUrl || undefined,
        price: parseFloat(price) || 0,
        status: "draft",
      });

      toast.success("Course created successfully as draft!");
      router.push("/tutor/studio");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== "tutor") {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <p className="text-xs text-muted-foreground/80">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex justify-center">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Back Link */}
        <Link href="/tutor/studio" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition">
          <FaArrowLeft /> Back to studio dashboard
        </Link>

        {/* Title */}
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-extrabold text-foreground">Create New Course</h1>
          <p className="text-xs text-muted-foreground font-light mt-1">Specify metadata for your custom syllabus module.</p>
        </div>

        {/* Create Course Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-3xl p-8 space-y-6">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Course Title *</label>
            <input
              type="text"
              placeholder="e.g. Master React in 30 Days"
              className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Short Subtitle</label>
            <input
              type="text"
              placeholder="e.g. Complete guide to hooks, routing, and context APIs."
              className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Detailed Syllabus Summary</label>
            <textarea
              placeholder="Write summary description about syllabus topics..."
              className="w-full h-24 bg-background border border-border rounded-lg text-foreground text-xs p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Grid Category, Level, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-bold uppercase">Subject Category</label>
              <select
                className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-bold uppercase">Complexity Level</label>
              <select
                className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {levelsList.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl} Level</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-bold uppercase">Course Price (INR)</label>
              <div className="w-full h-10 bg-muted/20 border border-border rounded-lg text-foreground text-xs px-3 flex items-center font-mono select-none justify-between">
                <span>₹{price}</span>
                <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-heading uppercase font-bold tracking-wider">Platform Controlled</span>
              </div>
            </div>
          </div>

          {/* Image Thumbnail Selector */}
          <div className="space-y-2">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Cover Thumbnail</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-border flex items-center justify-center relative">
                {thumbnailPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- Dynamic thumbnail upload preview */
                  <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FaGraduationCap className="text-slate-800 text-4xl" />
                )}
              </div>

              <div className="space-y-3">
                <div className="relative h-10 border border-border bg-background rounded-lg flex items-center justify-center text-xs font-semibold hover:border-border transition cursor-pointer">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <FaCloudUploadAlt className="text-sm" /> Select Thumbnail File
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground/80 leading-normal">
                  Supported formats: JPG, PNG, WebP. Suggested size: 16:9 aspect ratio (1280x720).
                </p>
              </div>

            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-blue-500/10 cursor-pointer">
            {submitting ? "Creating Course..." : "Create Course"}
          </button>

        </form>

      </div>
    </div>
  );
}
