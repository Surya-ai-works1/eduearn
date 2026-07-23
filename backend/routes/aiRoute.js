import express from "express";
import { 
  searchWithAi, 
  chatWithTutor, 
  generateCourseSyllabus, 
  generateNotes, 
  generateQuiz, 
  generateFlashcards, 
  generateStudyPlan, 
  solveDoubt, 
  getCareerAdvice,
  studyAssist,
  researchAssist,
  resumeBuilder,
  interviewCoach,
  translateText,
  generateSummary,
  voiceTutor,
  pdfChat,
  mindMaps,
  getAiHistory,
  toggleFavoriteAiLog,
  getAiFavorites
} from "../controllers/aiController.js";
import isAuth from "../middlewares/isAuth.js";

const aiRouter = express.Router();

// Public
aiRouter.post("/search", searchWithAi);

// Protected Core Modules
aiRouter.post("/chat", isAuth, chatWithTutor);
aiRouter.post("/generate-course", isAuth, generateCourseSyllabus);
aiRouter.post("/generate-notes", isAuth, generateNotes);
aiRouter.post("/generate-quiz", isAuth, generateQuiz);
aiRouter.post("/generate-flashcards", isAuth, generateFlashcards);
aiRouter.post("/generate-study-plan", isAuth, generateStudyPlan);
aiRouter.post("/solve-doubt", isAuth, solveDoubt);
aiRouter.post("/career-advice", isAuth, getCareerAdvice);

// New Workspace Modules
aiRouter.post("/study-assistant", isAuth, studyAssist);
aiRouter.post("/research-assistant", isAuth, researchAssist);
aiRouter.post("/resume-builder", isAuth, resumeBuilder);
aiRouter.post("/interview-coach", isAuth, interviewCoach);
aiRouter.post("/translate", isAuth, translateText);
aiRouter.post("/summarize", isAuth, generateSummary);

// Architecture Placeholders
aiRouter.post("/voice-tutor", isAuth, voiceTutor);
aiRouter.post("/pdf-chat", isAuth, pdfChat);
aiRouter.post("/mind-maps", isAuth, mindMaps);

// Logs Auditing & Favorites
aiRouter.get("/history", isAuth, getAiHistory);
aiRouter.get("/favorites", isAuth, getAiFavorites);
aiRouter.post("/favorite/:logId", isAuth, toggleFavoriteAiLog);

// Tutor AI Studio Creators Tools
import isTutor from "../middlewares/isTutor.js";
import {
  generateCourseDescription,
  generateThumbnailCoverPrompt,
  generateLessonPlan
} from "../controllers/aiController.js";
aiRouter.post("/course-description", isAuth, isTutor, generateCourseDescription);
aiRouter.post("/thumbnail-prompt", isAuth, isTutor, generateThumbnailCoverPrompt);
aiRouter.post("/lesson-plan", isAuth, isTutor, generateLessonPlan);

export default aiRouter;