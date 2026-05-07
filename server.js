let isElectionOpen = true;
require("dotenv").config();
require("./db");
const Vote = require("./models/Vote");
const express = require("express");

const app = express();

const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://votechain-frontend-chi.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

const User = require("./models/User");

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, middleName, phone, nin, dob } = req.body;

    // ✅ Validate inputs
    if (!firstName || !lastName || !phone || !nin || !dob) {
      return res.status(400).json({
        error: "All required fields must be filled",
      });
    }

    if (!/^\d{11}$/.test(nin) || !/^\d{11}$/.test(phone)) {
      return res.status(400).json({
        error: "Phone and NIN must be exactly 11 digits",
      });
    }

    // ✅ Check if user exists
    const existingUser = await User.findOne({
      $or: [{ nin }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    // ✅ Save user
    const newUser = new User({
      firstName,
      lastName,
      middleName,
      phone,
      nin,
      dob,
    });

    await newUser.save();

    res.json({ message: "User registered successfully ✅" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { nin, phone } = req.body;

    if (!nin || !phone) {
      return res.status(400).json({
        error: "NIN and phone required",
      });
    }

    if (!/^\d{11}$/.test(nin) || !/^\d{11}$/.test(phone)) {
      return res.status(400).json({
        error: "Invalid format",
      });
    }

    const user = await User.findOne({ nin, phone });

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    res.json({
      message: "Login successful ✅",
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🗳️ Vote endpoint
app.post("/vote", async (req, res) => {
  try {
    const { candidate, nin } = req.body;

    // ✅ Check input
    if (!candidate || !nin) {
      return res.status(400).json({
        error: "Candidate and NIN required",
      });
    }

    // ✅ Validate NIN
    if (!/^\d{11}$/.test(nin)) {
      return res.status(400).json({
        error: "Invalid NIN format",
      });
    }

    // ✅ CHECK IF USER EXISTS (NEW 🔥)
    const user = await User.findOne({ nin });

    if (!user) {
      return res.status(400).json({
        error: "You must register before voting",
      });
    }

    // ✅ Prevent duplicate vote
    const existingVote = await Vote.findOne({ nin });

    if (existingVote) {
      return res.status(400).json({
        error: "You have already voted",
      });
    }

    if (!global.isElectionOpen) {
  return res.status(403).json({
    error: "Election is closed",
  });
}

    // ✅ Save vote
    const newVote = new Vote({ candidate, nin });
    await newVote.save();

    res.json({ message: "Vote saved ✅" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔐 ADMIN LOGIN
const jwt = require("jsonwebtoken");
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({
      error: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    next();

  } catch (error) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};

// =========================
// 🔐 ADMIN LOGIN (UPDATED)
// =========================
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
    });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// 👥 GET ALL VOTERS (ADMIN)
app.get("/voters", verifyAdmin, async (req, res) => {
  try {
    const votes = await Vote.find();

    const voters = votes.map((v) => {
      // 🔐 Mask NIN (first 3 + last 3 visible)
      const maskedNin =
        v.nin.slice(0, 3) + "*****" + v.nin.slice(-3);

      return {
        nin: maskedNin,
        candidate: v.candidate,
      };
    });

    res.json(voters);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🗳️ Toggle election
app.post("/toggle-election", verifyAdmin, (req, res) => {
  isElectionOpen = !isElectionOpen;

  res.json({
    status: isElectionOpen,
    message: isElectionOpen
      ? "Election is now OPEN"
      : "Election is now CLOSED",
  });
});

app.get("/election-status", (req, res) => {
  res.json({
    isOpen: isElectionOpen,
  });
});

// 👥 GET ALL REGISTERED USERS (ADMIN)
app.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find();

    // Optional: mask sensitive info
    const safeUsers = users.map((u) => ({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      nin: u.nin.slice(0, 3) + "*****" + u.nin.slice(-3),
      dob: u.dob,
    }));

    res.json(safeUsers);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 📊 Results endpoint
app.get("/results", async (req, res) => {
  const votes = await Vote.find();

  const result = {};

  votes.forEach((v) => {
    result[v.candidate] = (result[v.candidate] || 0) + 1;
  });

  res.json(result);
});

app.delete("/reset-votes", verifyAdmin, async (req, res) => {
  await Vote.deleteMany({});
  res.json({
  message: "Votes cleared successfully",
});
});

// 🗑️ DELETE USER
app.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully ✅" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});