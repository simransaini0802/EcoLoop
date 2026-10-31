import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Please log in to continue." });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "development_only_change_me");
    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Account not found." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid or expired. Please log in again." });
  }
}

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action." });
  }
  next();
};
