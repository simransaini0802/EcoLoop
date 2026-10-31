import { Router } from "express";
import CollectionRequest from "../models/CollectionRequest.js";
import User from "../models/User.js";
import RewardTransaction from "../models/RewardTransaction.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
const pointsPerKg = { Plastic: 10, Paper: 8, Glass: 7, Metal: 12, "E-waste": 15, Organic: 4 };

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === "user") filter.user = req.user._id;
    if (req.user.role === "collector") filter.collector = req.user._id;
    const requests = await CollectionRequest.find(filter)
      .populate("user", "name email").populate("collector", "name email")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) { next(err); }
});

router.post("/", allowRoles("user", "admin"), async (req, res, next) => {
  try {
    const { category, quantityKg, address, scheduledDate, notes = "" } = req.body;
    const allowed = ["Plastic", "Paper", "Glass", "Metal", "E-waste", "Organic"];
    const quantity = Number(quantityKg);
    const date = new Date(scheduledDate);
    if (!allowed.includes(category)) return res.status(400).json({ message: "Choose a valid waste category." });
    if (!Number.isFinite(quantity) || quantity < 0.1 || quantity > 10000) return res.status(400).json({ message: "Quantity must be between 0.1 and 10,000 kg." });
    if (!address?.trim()) return res.status(400).json({ message: "Collection address is required." });
    if (Number.isNaN(date.getTime()) || date < new Date(new Date().setHours(0,0,0,0))) return res.status(400).json({ message: "Choose a valid future date." });
    const request = await CollectionRequest.create({
      user: req.user._id, category, quantityKg: quantity, address: address.trim(),
      scheduledDate: date, notes: notes.trim()
    });
    await request.populate("user", "name email");
    res.status(201).json({ request });
  } catch (err) { next(err); }
});

router.patch("/:id/assign", allowRoles("admin"), async (req, res, next) => {
  try {
    const { collectorId } = req.body;
    const collector = await User.findOne({ _id: collectorId, role: "collector" });
    if (!collector) return res.status(400).json({ message: "Select a valid collector account." });
    const request = await CollectionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Collection request not found." });
    if (["completed", "cancelled"].includes(request.status)) return res.status(400).json({ message: "This request can no longer be assigned." });
    request.collector = collector._id;
    request.status = "assigned";
    await request.save();
    await request.populate("user", "name email");
    await request.populate("collector", "name email");
    res.json({ request });
  } catch (err) { next(err); }
});

router.patch("/:id/status", allowRoles("collector", "admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ["in_progress", "completed", "cancelled"];
    if (!valid.includes(status)) return res.status(400).json({ message: "Invalid status." });
    const request = await CollectionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Collection request not found." });
    if (req.user.role === "collector" && String(request.collector) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can update only requests assigned to you." });
    }
    if (request.status === "completed" && status !== "completed") return res.status(400).json({ message: "Completed requests cannot be reopened." });
    request.status = status;
    if (status === "completed" && !request.pointsAwarded) {
      const points = Math.round(request.quantityKg * (pointsPerKg[request.category] || 0));
      await User.findByIdAndUpdate(request.user, { $inc: { points } });
      await RewardTransaction.create({ user: request.user, request: request._id, points, description: `${request.category} recycling (${request.quantityKg} kg)` });
      request.pointsAwarded = true;
    }
    await request.save();
    await request.populate("user", "name email");
    await request.populate("collector", "name email");
    res.json({ request });
  } catch (err) { next(err); }
});

export default router;
