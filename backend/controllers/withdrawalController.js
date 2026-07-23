import Withdrawal from "../models/withdrawalModel.js";
import User from "../models/userModel.js";

// 1. Request Payout
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, paymentDetails } = req.body;
    if (!amount || !paymentDetails) {
      return res.status(400).json({ message: "Amount and Payment details are required" });
    }

    const tutor = await User.findById(req.userId);
    if (tutor.role !== "educator") {
      return res.status(403).json({ message: "Only tutors can request withdrawals" });
    }

    // Check for any active pending withdrawal request
    const pendingWithdrawal = await Withdrawal.findOne({ tutor: req.userId, status: "pending" });
    if (pendingWithdrawal) {
      return res.status(400).json({ message: "You already have a pending withdrawal request" });
    }

    const withdrawal = await Withdrawal.create({
      tutor: req.userId,
      amount,
      paymentDetails
    });

    return res.status(201).json({ message: "Withdrawal request submitted successfully", withdrawal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to request withdrawal" });
  }
};

// 2. Get Tutor Withdrawal requests
export const getTutorWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ tutor: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json(withdrawals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch payout requests" });
  }
};
