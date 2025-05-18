import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { requireAuth } from "../middleware/requireAuth";

const routers = Router();

routers.post("/register", async (req: any, res: any) => {
  const { firstName, lastName, username, email, password } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({
    firstName,
    lastName,
    username,
    email,
    password: hashed,
  });

  try {
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
routers.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  req.session.userId = user._id;
  res.status(200).json({ message: "Logged in" });
});

// POST /api/auth/logout
routers.post("/logout", (req: any, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

routers.get("/me", async (req: any, res: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

routers.get("/secret", requireAuth, (req, res) => {
  res.json({ message: "🎉 This is protected data only for logged-in users!" });
});

export default routers;
