const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "viewer"], default: "viewer" }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);