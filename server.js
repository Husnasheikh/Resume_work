const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Import Routes
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Use Routes
app.use("/students", studentRoutes);
app.use("/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Student Management System backend running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});