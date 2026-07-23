import LiveClass from "../models/liveClassModel.js";
import Course from "../models/courseModel.js";

// 1. Create Live Class (Tutor)
export const createLiveClass = async (req, res) => {
  try {
    const { title, description, courseId, meetingLink, scheduledAt, duration } = req.body;
    if (!title || !courseId || !meetingLink || !scheduledAt) {
      return res.status(400).json({ message: "Title, Course, Link, and Schedule date are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to schedule live classes for this course" });
    }

    const liveClass = await LiveClass.create({
      title,
      description,
      course: courseId,
      meetingLink,
      scheduledAt,
      duration: duration || 60
    });

    return res.status(201).json(liveClass);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to schedule live class" });
  }
};

// 2. Get Course Live Classes
export const getCourseLiveClasses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const liveClasses = await LiveClass.find({ course: courseId }).sort({ scheduledAt: 1 });
    return res.status(200).json(liveClasses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch live classes" });
  }
};

// 3. Delete Live Class (Tutor)
export const deleteLiveClass = async (req, res) => {
  try {
    const { liveClassId } = req.params;
    const liveClass = await LiveClass.findById(liveClassId).populate("course");
    if (!liveClass) {
      return res.status(404).json({ message: "Live class session not found" });
    }

    if (liveClass.course.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this live class session" });
    }

    await LiveClass.findByIdAndDelete(liveClassId);
    return res.status(200).json({ message: "Live class deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete live class" });
  }
};
