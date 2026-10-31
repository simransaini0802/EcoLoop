import { Router } from "express";
import { protect } from "../middleware/auth.js";
import CollectionRequest from "../models/CollectionRequest.js";
import User from "../models/User.js";

const router = Router();
router.get("/stats", protect, async (req, res, next) => {
  try {
    const filter = req.user.role === "user" ? { user: req.user._id } :
      req.user.role === "collector" ? { collector: req.user._id } : {};
    const [total, pending, completed, quantity, byCategory, recent, users, collectors] = await Promise.all([
      CollectionRequest.countDocuments(filter),
      CollectionRequest.countDocuments({ ...filter, status: { $in: ["pending", "assigned", "in_progress"] } }),
      CollectionRequest.countDocuments({ ...filter, status: "completed" }),
      CollectionRequest.aggregate([{ $match: { ...filter, status: "completed" } }, { $group: { _id: null, total: { $sum: "$quantityKg" } } }]),
      CollectionRequest.aggregate([{ $match: filter }, { $group: { _id: "$category", count: { $sum: 1 }, kg: { $sum: "$quantityKg" } } }, { $sort: { count: -1 } }]),
      CollectionRequest.find(filter).populate("user", "name").populate("collector", "name").sort({ createdAt: -1 }).limit(5),
      req.user.role === "admin" ? User.countDocuments({ role: "user" }) : Promise.resolve(undefined),
      req.user.role === "admin" ? User.countDocuments({ role: "collector" }) : Promise.resolve(undefined)
    ]);
    res.json({ stats: {
      totalRequests: total, pendingRequests: pending, completedRequests: completed,
      totalKgCollected: Math.round((quantity[0]?.total || 0) * 10) / 10,
      byCategory, recent, ...(req.user.role === "admin" ? { users, collectors } : {})
    }});
  } catch (err) { next(err); }
});
export default router;
