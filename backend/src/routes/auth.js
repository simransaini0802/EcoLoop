import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const publicUser = (user) => ({
  id: user._id, name: user.name, email: user.email, role: user.role,
  address: user.address, points: user.points
});
const tokenFor = (user) => jwt.sign(
  { id: user._id }, process.env.JWT_SECRET || "development_only_change_me", { expiresIn: "7d" }
);

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, address = "" } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({
      name: name.trim(), email: email.toLowerCase().trim(),
      passwordHash: await bcrypt.hash(password, 12), address: address.trim()
    });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
