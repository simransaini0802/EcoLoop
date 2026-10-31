import { Router } from "express";
import { protect } from "../middleware/auth.js";
import RewardTransaction from "../models/RewardTransaction.js";
const router = Router();
router.get("/", protect, async (req, res, next) => {
  try {
    const transactions = await RewardTransaction.find({ user: req.user._id })
      .populate("request", "category quantityKg scheduledDate")
      .sort({ createdAt: -1 }).limit(50);
    res.json({ points: req.user.points, transactions });
  } catch (err) { next(err); }
});
export default router;
