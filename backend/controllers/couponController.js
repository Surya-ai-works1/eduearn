import Coupon from "../models/couponModel.js";
import Course from "../models/courseModel.js";

// Create Coupon (Tutor action)
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, courseId, expiryDate } = req.body;
    
    if (!code || !discountValue) {
      return res.status(400).json({ message: "Coupon code and discount value are required." });
    }

    // Verify if course belongs to the tutor if courseId is passed
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course || course.creator.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: "Access denied. You can only create coupons for your own courses." });
      }
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists." });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType || "percentage",
      discountValue,
      course: courseId || null,
      creator: req.userId,
      expiryDate: expiryDate || null
    });

    return res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create coupon" });
  }
};

// Get Tutors created coupons
export const getTutorCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ creator: req.userId }).populate("course", "title");
    return res.status(200).json(coupons);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    if (coupon.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }
    await coupon.deleteOne();
    return res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete coupon" });
  }
};

// Validate Coupon (Student Checkout action)
export const validateCoupon = async (req, res) => {
  try {
    const { code, courseId } = req.body;
    if (!code || !courseId) {
      return res.status(400).json({ message: "Coupon code and course ID are required." });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid or inactive coupon code." });
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Coupon code has expired." });
    }

    // Verify course specificity
    if (coupon.course && coupon.course.toString() !== courseId.toString()) {
      return res.status(400).json({ message: "Coupon code is not applicable to this course." });
    }

    return res.status(200).json({
      message: "Coupon applied successfully",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to validate coupon" });
  }
};
