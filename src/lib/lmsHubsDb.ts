import { createClient } from "./supabase";

// Types
export interface Post {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  title: string;
  content: string;
  image_url?: string;
  tags?: string[];
  correct_comment_id?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  has_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  content: string;
  parent_id?: string;
  is_correct: boolean;
  created_at: string;
  replies?: Comment[];
}

export interface StudyGroup {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  category?: string;
  avatar_url?: string;
  created_at: string;
  members_count?: number;
  is_member?: boolean;
}

export interface AiHistoryLog {
  id: string;
  user_id: string;
  tool_type: string;
  prompt: string;
  response: string;
  is_favorite: boolean;
  created_at: string;
}

// ─── NEW: Saved Notes ────────────────────────────────────────────────────────
export interface SavedNote {
  id: string;
  user_id: string;
  title: string;
  content: string; // markdown
  module: string;  // 'notes' | 'quiz' | 'flashcards' | 'study'
  tags?: string[];
  course_id?: string;
  created_at: string;
  updated_at: string;
}

// ─── NEW: Persistent AI Chat Sessions ───────────────────────────────────────
export interface AiChatSession {
  id: string;
  user_id: string;
  title: string;
  module: string;
  messages: Array<{ role: 'user' | 'ai'; content: string; timestamp: string }>;
  is_pinned: boolean;
  course_id?: string;
  created_at: string;
  updated_at: string;
}

// ─── NEW: Tutor Assistant Configuration ─────────────────────────────────────
export interface AssistantConfig {
  id: string;
  tutor_id: string;
  course_id: string;
  name: string;
  persona: string;          // e.g. 'Friendly tutor', 'Strict examiner'
  tone: string;             // e.g. 'encouraging', 'professional'
  system_prompt: string;    // Custom system prompt
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeRecord {
  id: string;
  user_id: string;
  title: string;
  raw_text?: string;
  parsed_data?: any;
  score: number;
  suggestions?: any;
  file_url?: string;
  created_at: string;
}

export interface CareerRoadmap {
  id: string;
  user_id: string;
  role_title: string;
  steps: any;
  created_at: string;
}

// Get the Supabase client
function getSupabase() {
  return createClient();
}

// ---------------------------------------------------------
// UNIFIED HUBS & FORUMS DATABASE SERVICE
// ---------------------------------------------------------
export const lmsHubsDb = {
  // --- AI HUB HISTORY ---
  getAiHistory: async (userId: string, toolType?: string): Promise<AiHistoryLog[]> => {
    const supabase = getSupabase();
    let query = supabase.from("ai_history").select("*").eq("user_id", userId);
    if (toolType) {
      query = query.eq("tool_type", toolType);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  saveAiLog: async (userId: string, toolType: string, prompt: string, response: string): Promise<AiHistoryLog> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("ai_history")
      .insert({ user_id: userId, tool_type: toolType, prompt, response })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  toggleFavorite: async (logId: string): Promise<boolean> => {
    const supabase = getSupabase();
    const { data: current } = await supabase.from("ai_history").select("is_favorite").eq("id", logId).single();
    const nextVal = current ? !current.is_favorite : true;
    const { error } = await supabase.from("ai_history").update({ is_favorite: nextVal }).eq("id", logId);
    if (error) throw error;
    return nextVal;
  },

  // --- COMMUNITY POSTS & FEED ---
  getPosts: async (currentUserId?: string): Promise<Post[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("posts")
      .select("*, post_likes(*), comments(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data || []).map((p: any) => ({
      ...p,
      likes_count: p.post_likes?.length || 0,
      comments_count: p.comments?.length || 0,
      has_liked: currentUserId ? p.post_likes?.some((l: any) => l.user_id === currentUserId) : false,
    }));
  },

  createPost: async (userId: string, userName: string, title: string, content: string, tags: string[], imageUrl?: string): Promise<Post> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("posts")
      .insert({ user_id: userId, title, content, tags, image_url: imageUrl })
      .select()
      .single();
    if (error) throw error;
    return { ...data, user_name: userName };
  },

  likePost: async (userId: string, postId: string): Promise<boolean> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("post_likes").insert({ user_id: userId, post_id: postId });
    if (error) throw error;
    return true;
  },

  unlikePost: async (userId: string, postId: string): Promise<boolean> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("post_likes").delete().match({ user_id: userId, post_id: postId });
    if (error) throw error;
    return true;
  },

  // --- COMMENTS & REPLIES ---
  getComments: async (postId: string): Promise<Comment[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;

    const allComments: Comment[] = data || [];
    const parents = allComments.filter((c) => !c.parent_id);
    parents.forEach((p) => {
      p.replies = allComments.filter((c) => c.parent_id === p.id);
    });
    return parents;
  },

  createComment: async (userId: string, userName: string, postId: string, content: string, parentId?: string): Promise<Comment> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("comments")
      .insert({ user_id: userId, post_id: postId, content, parent_id: parentId })
      .select()
      .single();
    if (error) throw error;
    return { ...data, user_name: userName };
  },

  markCorrectAnswer: async (postId: string, commentId: string): Promise<boolean> => {
    const supabase = getSupabase();
    const { error: err1 } = await supabase.from("posts").update({ correct_comment_id: commentId }).eq("id", postId);
    if (err1) throw err1;
    const { error: err2 } = await supabase.from("comments").update({ is_correct: true }).eq("id", commentId);
    if (err2) throw err2;
    return true;
  },

  // --- STUDY GROUPS ---
  getStudyGroups: async (currentUserId?: string): Promise<StudyGroup[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("study_groups")
      .select("*, study_group_members(*)");
    if (error) throw error;
    return (data || []).map((g: any) => ({
      ...g,
      members_count: g.study_group_members?.length || 0,
      is_member: currentUserId ? g.study_group_members?.some((m: any) => m.user_id === currentUserId) : false,
    }));
  },

  createStudyGroup: async (userId: string, title: string, description: string, category: string): Promise<StudyGroup> => {
    const supabase = getSupabase();
    const { data: group, error: err1 } = await supabase
      .from("study_groups")
      .insert({ creator_id: userId, title, description, category })
      .select()
      .single();
    if (err1) throw err1;

    await supabase.from("study_group_members").insert({ group_id: group.id, user_id: userId });
    return group;
  },

  joinStudyGroup: async (userId: string, groupId: string): Promise<boolean> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("study_group_members").insert({ group_id: groupId, user_id: userId });
    if (error) throw error;
    return true;
  },

  leaveStudyGroup: async (userId: string, groupId: string): Promise<boolean> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("study_group_members").delete().match({ group_id: groupId, user_id: userId });
    if (error) throw error;
    return true;
  },

  // --- CAREER HUB RESUMES ---
  getResumes: async (userId: string): Promise<ResumeRecord[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("resumes").select("*").eq("user_id", userId);
    if (error) throw error;
    return data || [];
  },

  saveResume: async (userId: string, title: string, rawText: string, parsedData: any, score: number, suggestions: any, fileUrl?: string): Promise<ResumeRecord> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("resumes")
      .insert({ user_id: userId, title, raw_text: rawText, parsed_data: parsedData, score, suggestions, file_url: fileUrl })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- CAREER ROADMAPS ---
  getRoadmaps: async (userId: string): Promise<CareerRoadmap[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("roadmaps").select("*").eq("user_id", userId);
    if (error) throw error;
    return data || [];
  },

  saveRoadmap: async (userId: string, roleTitle: string, steps: any): Promise<CareerRoadmap> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("roadmaps")
      .insert({ user_id: userId, role_title: roleTitle, steps })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ─── LOCAL STORAGE FALLBACKS FOR AI FEATURES ──────────────────────────────
  // When tables notes, ai_sessions, or assistant_configs do not exist in the 
  // database (e.g. migration not run yet), these localStore helpers keep the 
  // features fully functional.
  // ──────────────────────────────────────────────────────────────────────────
  
  // Helper to check for missing table relation errors
  isMissingTableError: (error: any): boolean => {
    if (!error) return false;
    const msg = (error.message || "").toLowerCase();
    const details = (error.details || "").toLowerCase();
    return (
      error.code === "42P01" ||
      error.code === "PGRST116" ||
      msg.includes("relation") ||
      msg.includes("does not exist") ||
      details.includes("relation") ||
      details.includes("does not exist")
    );
  },

  generateUUID: (): string => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  localStore: {
    getNotes: (userId: string, search?: string): SavedNote[] => {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(`eduearn_notes_${userId}`);
      let list: SavedNote[] = raw ? JSON.parse(raw) : [];
      if (search?.trim()) {
        const s = search.toLowerCase();
        list = list.filter(n => n.title.toLowerCase().includes(s));
      }
      return list;
    },
    saveNote: (userId: string, title: string, content: string, module: string, tags?: string[], courseId?: string): SavedNote => {
      const list = lmsHubsDb.localStore.getNotes(userId);
      const now = new Date().toISOString();
      const newNote: SavedNote = {
        id: lmsHubsDb.generateUUID(),
        user_id: userId,
        title,
        content,
        module,
        tags: tags ?? [],
        course_id: courseId ?? undefined,
        created_at: now,
        updated_at: now
      };
      list.unshift(newNote);
      localStorage.setItem(`eduearn_notes_${userId}`, JSON.stringify(list));
      return newNote;
    },
    updateNote: (noteId: string, title: string, content: string): SavedNote => {
      if (typeof window === "undefined") throw new Error("Window undefined");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("eduearn_notes_")) {
          const list: SavedNote[] = JSON.parse(localStorage.getItem(key) || "[]");
          const idx = list.findIndex(n => n.id === noteId);
          if (idx !== -1) {
            list[idx].title = title;
            list[idx].content = content;
            list[idx].updated_at = new Date().toISOString();
            localStorage.setItem(key, JSON.stringify(list));
            return list[idx];
          }
        }
      }
      throw new Error("Note not found");
    },
    deleteNote: (noteId: string): void => {
      if (typeof window === "undefined") return;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("eduearn_notes_")) {
          const list: SavedNote[] = JSON.parse(localStorage.getItem(key) || "[]");
          const filtered = list.filter(n => n.id !== noteId);
          if (filtered.length !== list.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
            return;
          }
        }
      }
    },

    getChatSessions: (userId: string): AiChatSession[] => {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(`eduearn_sessions_${userId}`);
      return raw ? JSON.parse(raw) : [];
    },
    saveChatSession: (session: Omit<AiChatSession, "id" | "created_at" | "updated_at">): AiChatSession => {
      const list = lmsHubsDb.localStore.getChatSessions(session.user_id);
      const now = new Date().toISOString();
      const newSession: AiChatSession = {
        ...session,
        id: lmsHubsDb.generateUUID(),
        created_at: now,
        updated_at: now
      };
      list.unshift(newSession);
      localStorage.setItem(`eduearn_sessions_${session.user_id}`, JSON.stringify(list));
      return newSession;
    },
    updateChatSession: (sessionId: string, updates: Partial<AiChatSession>): void => {
      if (typeof window === "undefined") return;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("eduearn_sessions_")) {
          const list: AiChatSession[] = JSON.parse(localStorage.getItem(key) || "[]");
          const idx = list.findIndex(s => s.id === sessionId);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
            localStorage.setItem(key, JSON.stringify(list));
            return;
          }
        }
      }
    },
    deleteChatSession: (sessionId: string): void => {
      if (typeof window === "undefined") return;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("eduearn_sessions_")) {
          const list: AiChatSession[] = JSON.parse(localStorage.getItem(key) || "[]");
          const filtered = list.filter(s => s.id !== sessionId);
          if (filtered.length !== list.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
            return;
          }
        }
      }
    },

    getAssistantConfig: (courseId: string): AssistantConfig | null => {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(`eduearn_assist_config_${courseId}`);
      return raw ? JSON.parse(raw) : null;
    },
    upsertAssistantConfig: (config: Omit<AssistantConfig, "id" | "created_at" | "updated_at">): AssistantConfig => {
      const existing = lmsHubsDb.localStore.getAssistantConfig(config.course_id);
      const now = new Date().toISOString();
      const newConfig: AssistantConfig = {
        ...existing,
        ...config,
        id: existing?.id || lmsHubsDb.generateUUID(),
        created_at: existing?.created_at || now,
        updated_at: now
      };
      localStorage.setItem(`eduearn_assist_config_${config.course_id}`, JSON.stringify(newConfig));
      return newConfig;
    }
  },

  // ─── NOTES LIBRARY ────────────────────────────────────────────────────────
  getNotes: async (userId: string, search?: string): Promise<SavedNote[]> => {
    try {
      const supabase = getSupabase();
      
      // Auto-sync local notes once online
      if (typeof window !== "undefined" && navigator.onLine) {
        const localNotes = lmsHubsDb.localStore.getNotes(userId);
        if (localNotes.length > 0) {
          console.log(`Syncing ${localNotes.length} offline notes to Supabase...`);
          let syncedCount = 0;
          for (const localNote of localNotes) {
            try {
              const { error } = await supabase.from("notes").insert({
                user_id: userId,
                title: localNote.title,
                content: localNote.content,
                module: localNote.module,
                tags: localNote.tags ?? [],
                course_id: localNote.course_id || null,
                created_at: localNote.created_at,
                updated_at: localNote.updated_at,
              });
              if (!error) syncedCount++;
            } catch (err) {
              console.warn("Failed to sync individual note:", err);
            }
          }
          if (syncedCount === localNotes.length) {
            localStorage.removeItem(`eduearn_notes_${userId}`);
            console.log("All offline notes synchronized successfully!");
          }
        }
      }

      let query = supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (search?.trim()) {
        query = query.ilike("title", `%${search}%`);
      }
      const { data, error } = await query;
      if (error) {
        console.warn("Supabase getNotes failed, using localStorage:", error);
        return lmsHubsDb.localStore.getNotes(userId, search);
      }
      return data || [];
    } catch (err: any) {
      console.warn("Supabase getNotes failed, using localStorage:", err);
      return lmsHubsDb.localStore.getNotes(userId, search);
    }
  },

  saveNote: async (
    userId: string,
    title: string,
    content: string,
    module: string,
    tags?: string[],
    courseId?: string
  ): Promise<SavedNote> => {
    try {
      const supabase = getSupabase();
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: userId,
          title,
          content,
          module,
          tags: tags ?? [],
          course_id: courseId ?? null,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();
      if (error) {
        console.warn("Supabase saveNote failed, using localStorage:", error);
        return lmsHubsDb.localStore.saveNote(userId, title, content, module, tags, courseId);
      }
      return data;
    } catch (err: any) {
      console.warn("Supabase saveNote failed, using localStorage:", err);
      return lmsHubsDb.localStore.saveNote(userId, title, content, module, tags, courseId);
    }
  },

  updateNote: async (noteId: string, title: string, content: string): Promise<SavedNote> => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("notes")
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq("id", noteId)
        .select()
        .single();
      if (error) {
        console.warn("Supabase updateNote failed, using localStorage:", error);
        return lmsHubsDb.localStore.updateNote(noteId, title, content);
      }
      return data;
    } catch (err: any) {
      console.warn("Supabase updateNote failed, using localStorage:", err);
      return lmsHubsDb.localStore.updateNote(noteId, title, content);
    }
  },

  deleteNote: async (noteId: string): Promise<void> => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) {
        console.warn("Supabase deleteNote failed, using localStorage:", error);
        return lmsHubsDb.localStore.deleteNote(noteId);
      }
    } catch (err: any) {
      console.warn("Supabase deleteNote failed, using localStorage:", err);
      return lmsHubsDb.localStore.deleteNote(noteId);
    }
  },

  // ─── AI CHAT SESSIONS (persistent) ───────────────────────────────────────
  getChatSessions: async (userId: string): Promise<AiChatSession[]> => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("ai_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (error) {
        console.warn("Supabase getChatSessions failed, using localStorage:", error);
        return lmsHubsDb.localStore.getChatSessions(userId);
      }
      return data || [];
    } catch (err: any) {
      console.warn("Supabase getChatSessions failed, using localStorage:", err);
      return lmsHubsDb.localStore.getChatSessions(userId);
    }
  },

  saveChatSession: async (session: Omit<AiChatSession, "id" | "created_at" | "updated_at">): Promise<AiChatSession> => {
    try {
      const supabase = getSupabase();
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("ai_sessions")
        .insert({ ...session, created_at: now, updated_at: now })
        .select()
        .single();
      if (error) {
        console.warn("Supabase saveChatSession failed, using localStorage:", error);
        return lmsHubsDb.localStore.saveChatSession(session);
      }
      return data;
    } catch (err: any) {
      console.warn("Supabase saveChatSession failed, using localStorage:", err);
      return lmsHubsDb.localStore.saveChatSession(session);
    }
  },

  updateChatSession: async (sessionId: string, updates: Partial<AiChatSession>): Promise<void> => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("ai_sessions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", sessionId);
      if (error) {
        console.warn("Supabase updateChatSession failed, using localStorage:", error);
        return lmsHubsDb.localStore.updateChatSession(sessionId, updates);
      }
    } catch (err: any) {
      console.warn("Supabase updateChatSession failed, using localStorage:", err);
      return lmsHubsDb.localStore.updateChatSession(sessionId, updates);
    }
  },

  deleteChatSession: async (sessionId: string): Promise<void> => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("ai_sessions").delete().eq("id", sessionId);
      if (error) {
        console.warn("Supabase deleteChatSession failed, using localStorage:", error);
        return lmsHubsDb.localStore.deleteChatSession(sessionId);
      }
    } catch (err: any) {
      console.warn("Supabase deleteChatSession failed, using localStorage:", err);
      return lmsHubsDb.localStore.deleteChatSession(sessionId);
    }
  },

  // ─── TUTOR ASSISTANT CONFIGS ──────────────────────────────────────────────
  getAssistantConfig: async (courseId: string): Promise<AssistantConfig | null> => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("assistant_configs")
        .select("*")
        .eq("course_id", courseId)
        .maybeSingle();
      if (error) {
        console.warn("Supabase getAssistantConfig failed, using localStorage:", error);
        return lmsHubsDb.localStore.getAssistantConfig(courseId);
      }
      return data;
    } catch (err: any) {
      console.warn("Supabase getAssistantConfig failed, using localStorage:", err);
      return lmsHubsDb.localStore.getAssistantConfig(courseId);
    }
  },

  upsertAssistantConfig: async (config: Omit<AssistantConfig, "id" | "created_at" | "updated_at">): Promise<AssistantConfig> => {
    try {
      const supabase = getSupabase();
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("assistant_configs")
        .upsert(
          { ...config, updated_at: now },
          { onConflict: "course_id" }
        )
        .select()
        .single();
      if (error) {
        console.warn("Supabase upsertAssistantConfig failed, using localStorage:", error);
        return lmsHubsDb.localStore.upsertAssistantConfig(config);
      }
      return data;
    } catch (err: any) {
      console.warn("Supabase upsertAssistantConfig failed, using localStorage:", err);
      return lmsHubsDb.localStore.upsertAssistantConfig(config);
    }
  },
};

