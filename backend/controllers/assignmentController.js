import Assignment from "../models/assignmentModel.js";
import Submission from "../models/submissionModel.js";
import Course from "../models/courseModel.js";

// 1. Create Assignment (Tutor Only)
export const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, lectureId, dueDate } = req.body;
    if (!title || !courseId) {
      return res.status(400).json({ message: "Title and Course ID are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the caller is the course creator
    if (course.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to create assignment for this course" });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      lecture: lectureId || null,
      dueDate: dueDate || null
    });

    return res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create assignment" });
  }
};

// 2. Get Course Assignments
export const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ course: courseId }).populate("lecture", "lectureTitle");
    return res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

// 3. Submit Assignment (Student)
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content, fileUrl } = req.body; // Student content answer or attached file url

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if user already submitted
    let submission = await Submission.findOne({ assignment: assignmentId, student: req.userId });
    if (submission) {
      submission.content = content || submission.content;
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.submittedAt = Date.now();
      await submission.save();
      return res.status(200).json({ message: "Submission updated successfully", submission });
    }

    submission = await Submission.create({
      assignment: assignmentId,
      student: req.userId,
      content,
      fileUrl
    });

    return res.status(201).json({ message: "Assignment submitted successfully", submission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to submit assignment" });
  }
};

// 4. Get Student Submission status (For individual student dashboard)
export const getStudentSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submission = await Submission.findOne({ assignment: assignmentId, student: req.userId });
    return res.status(200).json(submission || null);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch submission details" });
  }
};

// 5. Get All Submissions for an Assignment (Tutor Only)
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignment: assignmentId }).populate("student", "name email photoUrl");
    return res.status(200).json(submissions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

// 6. Grade Assignment Submission (Tutor Only)
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(submissionId).populate({
      path: "assignment",
      populate: { path: "course" }
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Auth check: is request creator of course
    if (submission.assignment.course.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to grade this submission" });
    }

    submission.grade = grade || submission.grade;
    submission.feedback = feedback || submission.feedback;
    await submission.save();

    return res.status(200).json({ message: "Graded successfully", submission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to grade submission" });
  }
};
