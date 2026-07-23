import uploadOnCloudinary from "../configs/cloudinary.js"
import Course from "../models/courseModel.js"
import Lecture from "../models/lectureModel.js"
import User from "../models/userModel.js"
import Progress from "../models/progressModel.js"

// create Courses
export const createCourse = async (req,res) => {

    try {
        const {title,category} = req.body
        if(!title || !category){
            return res.status(400).json({message:"title and category is required"})
        }
        const course = await Course.create({
            title,
            category,
            creator: req.userId
        })
        
        return res.status(201).json(course)
    } catch (error) {
         return res.status(500).json({message:`Failed to create course ${error}`})
    }
    
}

export const getPublishedCourses = async (req,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate("lectures reviews")
        if(!courses)
        {
            return res.status(404).json({message:"Course not found"})
        }

        return res.status(200).json(courses)
        
    } catch (error) {
          return res.status(500).json({message:`Failed to get All  courses ${error}`})
    }
}


export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.userId
        const courses = await Course.find({creator:userId})
        if(!courses)
        {
            return res.status(404).json({message:"Course not found"})
        }
        return res.status(200).json(courses)
        
    } catch (error) {
        return res.status(500).json({message:`Failed to get creator courses ${error}`})
    }
}

export const editCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {title , subTitle , description , category , level , price , isPublished } = req.body;
        let thumbnail
         if(req.file){
            thumbnail =await uploadOnCloudinary(req.file.path)
                }
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
        const updateData = {title , subTitle , description , category , level , price , isPublished ,thumbnail}

        course = await Course.findByIdAndUpdate(courseId , updateData , {new:true})
        return res.status(201).json(course)
    } catch (error) {
        return res.status(500).json({message:`Failed to update course ${error}`})
    }
}


export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
         return res.status(200).json(course)
        
    } catch (error) {
        return res.status(500).json({message:`Failed to get course ${error}`})
    }
}
export const removeCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.deleteOne();
    return res.status(200).json({ message: "Course Removed Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:`Failed to remove course ${error}`})
  }
};



//create lecture

export const createLecture = async (req,res) => {
    try {
        const {lectureTitle}= req.body
        const {courseId} = req.params

        if(!lectureTitle || !courseId){
             return res.status(400).json({message:"Lecture Title required"})
        }
        const lecture = await Lecture.create({lectureTitle})
        const course = await Course.findById(courseId)
        if(course){
            course.lectures.push(lecture._id)
            
        }
        await course.populate("lectures")
        await course.save()
        return res.status(201).json({lecture,course})
        
    } catch (error) {
        return res.status(500).json({message:`Failed to Create Lecture ${error}`})
    }
    
}

export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params
        const course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
        await course.populate("lectures")
        await course.save()
        return res.status(200).json(course)
    } catch (error) {
        return res.status(500).json({message:`Failed to get Lectures ${error}`})
    }
}

export const editLecture = async (req,res) => {
    try {
        const {lectureId} = req.params
        const {isPreviewFree , lectureTitle} = req.body
        const lecture = await Lecture.findById(lectureId)
          if(!lecture){
            return res.status(404).json({message:"Lecture not found"})
        }
        let videoUrl
        if(req.file){
            videoUrl =await uploadOnCloudinary(req.file.path)
            lecture.videoUrl = videoUrl
                }
        if(lectureTitle){
            lecture.lectureTitle = lectureTitle
        }
        lecture.isPreviewFree = isPreviewFree
        
         await lecture.save()
        return res.status(200).json(lecture)
    } catch (error) {
        return res.status(500).json({message:`Failed to edit Lectures ${error}`})
    }
    
}

export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params
        const lecture = await Lecture.findByIdAndDelete(lectureId)
        if(!lecture){
             return res.status(404).json({message:"Lecture not found"})
        }
        //remove the lecture from associated course

        await Course.updateOne(
            {lectures: lectureId},
            {$pull:{lectures: lectureId}}
        )
        return res.status(200).json({message:"Lecture Remove Successfully"})
        }
    
     catch (error) {
        return res.status(500).json({message:`Failed to remove Lectures ${error}`})
    }
}



//get Creator data


// controllers/userController.js

export const getCreatorById = async (req, res) => {
  try {
    const {userId} = req.body;

    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json( user );
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "get Creator error" });
  }
};

// Course Progress tracking
export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;
    const studentId = req.userId;

    let progress = await Progress.findOne({ student: studentId, course: courseId });
    if (!progress) {
      progress = new Progress({ student: studentId, course: courseId, completedLectures: [] });
    }

    const isCompleted = progress.completedLectures.includes(lectureId);
    if (isCompleted) {
      progress.completedLectures = progress.completedLectures.filter(id => id.toString() !== lectureId);
    } else {
      progress.completedLectures.push(lectureId);
    }

    const course = await Course.findById(courseId).populate("lectures");
    const totalLectures = course ? course.lectures.length : 0;
    
    if (progress.completedLectures.length >= totalLectures && totalLectures > 0) {
      if (!progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = Date.now();
        await User.findByIdAndUpdate(studentId, { $inc: { xp: 100, coins: 50 } });
      }
    } else {
      progress.isCompleted = false;
      progress.completedAt = null;
    }

    await progress.save();
    return res.status(200).json({ message: "Progress updated successfully", progress });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update progress" });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    const progress = await Progress.findOne({ student: studentId, course: courseId });
    if (!progress) {
      return res.status(200).json({ completedLectures: [], isCompleted: false });
    }

    return res.status(200).json(progress);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch progress details" });
  }
};

// Create Course Skeleton with generated AI Syllabus Lectures
export const createCourseWithSyllabus = async (req, res) => {
  try {
    const { title, subTitle, description, category, level, price, lectures } = req.body;
    if (!title || !category) {
      return res.status(400).json({ message: "Title and Category are required" });
    }

    const course = await Course.create({
      title,
      subTitle,
      description,
      category,
      level: level || 'Beginner',
      price: price || 0,
      creator: req.userId,
      approvalStatus: 'pending' // requires admin approval
    });

    if (lectures && Array.isArray(lectures)) {
      for (const lec of lectures) {
        const lecture = await Lecture.create({
          lectureTitle: lec.title || lec.lectureTitle || "Untitled Lecture",
          isPreviewFree: !!lec.isPreviewFree
        });
        course.lectures.push(lecture._id);
      }
    }

    await course.save();
    return res.status(201).json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Failed to create course with syllabus: ${error.message}` });
  }
};




