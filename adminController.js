const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerAdmin = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword, role: role || "viewer" });
    await admin.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    if (role && admin.role !== role) {
      return res.status(403).json({ error: `You are not registered as ${role}` });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({ message: "Login successful", token, role: admin.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerAdmin, loginAdmin };