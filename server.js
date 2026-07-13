require("dotenv").config();
require("./db");
const Vote = require("./models/Vote");
const ElectionStatus = require("./models/ElectionStatus");
const Transaction = require("./models/Transaction");
const express = require("express");
const crypto = require("crypto");
const logger = require("./utils/logger");
const displayDashboard = require("./utils/dashboard");

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
app.use((req, res, next) => {

logger.info("REQUEST", `${req.method} ${req.url}`);

next();

});

app.set("trust proxy", true);

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

logger.register(newUser);

await displayDashboard("NEW USER REGISTERED");
logger.database("Users", newUser);

    res.json({ message: "User registered successfully ✅" });

  } catch (error) {
    logger.error(error.message);
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

logger.login(user);

await displayDashboard("USER LOGIN");;
    
    res.json({
      message: "Login successful ✅",
      user,
    });

  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// SAVE WALLET

// SAVE WALLET

app.post("/save-wallet", async(req,res)=>{


try{


const {
nin,
wallet
}=req.body;



if(!nin || !wallet){

return res.status(400).json({

error:"NIN and wallet required"

});

}



const user = await User.findOneAndUpdate(
    { nin },
    {
        wallet: wallet.toLowerCase()
    },
    {
        new: true
    }
);

if (!user) {

    return res.status(404).json({
        error: "User not found"
    });

}

logger.wallet(user);

await displayDashboard("WALLET CONNECTED");

res.json({
    message: "Wallet saved successfully",
    wallet: user.wallet
});


}


catch(error){

logger.error(error.message);


res.status(500).json({

error:"Server error"

});


}


});

// DISCONNECT WALLET

app.post("/disconnect-wallet", async(req,res)=>{


try{


const {nin}=req.body;



if(!nin){

return res.status(400).json({

error:"NIN required"

});

}



const user =
await User.findOne({nin});



if(!user){

return res.status(404).json({

error:"User not found"

});

}



user.wallet = null;

await user.save();

logger.warning("Wallet Disconnected");

await displayDashboard("WALLET DISCONNECTED");
res.json({
    message: "Wallet disconnected successfully"
});



}

catch(error){


logger.error(error.message);


res.status(500).json({

error:"Server error"

});


}


});

// 🗳️ VOTE ENDPOINT

app.post("/vote", async(req,res)=>{

logger.title("NEW BLOCKCHAIN VOTE");

try{


const {

candidate,

nin,

wallet,

signature


}=req.body;

logger.info("Candidate", candidate);
logger.info("NIN", nin);
logger.info("Wallet", wallet);



// =====================
// VALIDATION
// =====================


if(
!candidate ||
!nin ||
!wallet

){


return res.status(400).json({

error:
"Candidate, NIN and wallet required"

});


}






// =====================
// FIND USER
// =====================


const user =
await User.findOne({nin});

logger.success("User Verified");

if(!user){


return res.status(400).json({

error:
"User not registered"

});


}





// =====================
// CHECK WALLET MATCH
// =====================


if(!user.wallet){


return res.status(400).json({

error:
"Please connect wallet first"

});


}




if(
user.wallet.toLowerCase()
!==
wallet.toLowerCase()

){


return res.status(400).json({

error:
"Connected wallet does not match registered wallet"

});


}





// =====================
// CHECK DOUBLE VOTE
// =====================


if (user.hasVoted) {

return res.status(409).json({

error:"You have already cast your vote."

});

}



const alreadyVoted =
await Vote.findOne({nin});


if(alreadyVoted){

return res.status(400).json({

error:"You have already voted"

});

}





// =====================
// CHECK ELECTION STATUS
// =====================


const election =

await ElectionStatus.findOne();





if(
!election ||
!election.isOpen

){


return res.status(403).json({

error:
"Election closed"

});


}







// =====================
// SAVE VOTE
// =====================


const vote =

await Vote.create({

candidate,

nin,

wallet

});



// =====================
// UPDATE USER
// =====================


user.hasVoted = true;

await user.save();

logger.success("User Updated");

logger.database("Updated User", user);








// =====================
// CREATE TRANSACTION
// =====================



const transaction =
await Transaction.create({

nin,

wallet,

candidate,

signature,

hash:
"0x" +
crypto.randomBytes(32).toString("hex"),

status:"Confirmed",

timestamp:new Date()

});

logger.vote(
    user,
    transaction,
    candidate
);

await displayDashboard("NEW BLOCKCHAIN VOTE");



// =====================
// RESPONSE
// =====================

console.log("Vote Submitted Successfully");
console.log("============================\n");

res.json({

message:
"Vote successful ✅",


transaction


});






}

catch(error){


console.error(
"Vote Error:",
error
);



res.status(500).json({

error:
"Server error"

});



}



});

// 🔐 ADMIN LOGIN
const jwt = require("jsonwebtoken");
const verifyAdmin = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        logger.warning("Unauthorized Access Attempt");

        logger.info("Route", req.originalUrl);

        logger.info("IP", req.ip);

        return res.status(403).json({
            error: "No token provided"
        });

    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "admin") {

            logger.warning("Invalid Admin Access");

            logger.info("Route", req.originalUrl);

            return res.status(403).json({
                error: "Access denied"
            });

        }

        next();

    }

    catch (error) {

        logger.error(error.message);

        return res.status(401).json({
            error: "Invalid token"
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
      { expiresIn: "30d" }
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
app.get("/voters", verifyAdmin, async (req,res)=>{

try{

const votes = await Vote.find();

const voters = votes.map((v)=>({

nin:v.nin,

candidate:v.candidate

}));

logger.title("LIST OF VOTERS");

logger.info("Total Votes", voters.length);

logger.database(
    "Votes Collection",
    voters
);

await displayDashboard("VIEW VOTERS");

res.json(voters);

}catch(error){

logger.error(error.message);
res.status(500).json({
error:"Server error"
});

}

});

// 🗳️ Toggle election
app.post("/toggle-election", verifyAdmin, async (req,res)=>{

try{

let status = await ElectionStatus.findOne();

if(!status){

status = new ElectionStatus({
isOpen:true
});

}

status.isOpen = !status.isOpen;

await status.save();

logger.admin(
    status.isOpen
        ? "OPEN ELECTION"
        : "CLOSE ELECTION"
);

await displayDashboard(
    status.isOpen
        ? "ELECTION OPENED"
        : "ELECTION CLOSED"
);

res.json({

status: status.isOpen,

message: status.isOpen
? "Election is now OPEN"
: "Election is now CLOSED"

});

}catch(error){

logger.error(error.message);

res.status(500).json({
error:"Server error"
});

}

});

app.get("/election-status", async (req, res) => {

    try {

        let status = await ElectionStatus.findOne();

        if (!status) {

            status = await ElectionStatus.create({
                isOpen: true
            });

        }

        logger.title("ELECTION STATUS");

        logger.info(
            "Current Status",
            status.isOpen ? "OPEN" : "CLOSED"
        );

        await displayDashboard("ELECTION STATUS");

        res.json({

            isOpen: status.isOpen

        });

    }

    catch (error) {

        logger.error(error.message);

        res.status(500).json({
            error: "Server error"
        });

    }

});


// 👥 GET ALL REGISTERED USERS (ADMIN)
app.get("/users", verifyAdmin, async (req, res) => {

    try {

        const users = await User.find();

        const safeUsers = users.map((u) => ({
            id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            phone: u.phone,
            nin: u.nin,
            dob: u.dob,
            hasVoted: u.hasVoted
        }));

        logger.title("REGISTERED USERS");

        logger.info("Total Users", safeUsers.length);

        logger.database(
            "Users Collection",
            safeUsers
        );

        await displayDashboard("REGISTERED USERS");

        res.json(safeUsers);

    }

    catch (error) {

        logger.error(error.message);

        res.status(500).json({
            error: "Server error"
        });

    }

});

app.get("/transactions/:nin", async(req,res)=>{

try{

const transactions =
await Transaction.find({
nin:req.params.nin
})
.sort({
timestamp:-1
});

logger.title("USER TRANSACTIONS");

logger.info(
    "NIN",
    req.params.nin
);

logger.info(
    "Transactions",
    transactions.length
);

logger.database(
    "Blockchain Transactions",
    transactions
);

await displayDashboard("USER TRANSACTIONS");

res.json(transactions);


}

catch(error){

res.status(500).json({
error:error.message
});

}

});

// 📊 Results endpoint
app.get("/results", async (req, res) => {

    try {

        const votes = await Vote.find();

        const result = {};

        votes.forEach((v) => {

            result[v.candidate] =
                (result[v.candidate] || 0) + 1;

        });

        logger.title("RESULTS GENERATED");

        logger.database(
            "Election Results",
            result
        );

        await displayDashboard("RESULTS GENERATED");

        res.json(result);

    }

    catch (error) {

        logger.error(error.message);

        res.status(500).json({
            error: "Server error"
        });

    }

});

// GET USER WALLET

app.get("/user/:nin", async (req, res) => {

    try {

        const user = await User.findOne({
            nin: req.params.nin
        });

        if (!user) {

            return res.status(404).json({
                error: "User not found"
            });

        }

logger.title("PROFILE REQUEST");

logger.info(
    "User",
    user.firstName + " " + user.lastName
);

logger.info(
    "Wallet",
    user.wallet || "Not Connected"
);

logger.info(
    "Voting",
    user.hasVoted
        ? "Already Voted"
        : "Not Yet Voted"
);

logger.database(
    "User Profile",
    user
);

await displayDashboard("USER PROFILE");

        res.json({

            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            phone: user.phone,
            nin: user.nin,
            dob: user.dob,
            wallet: user.wallet,
            hasVoted: user.hasVoted

        });

    }

    catch (error) {

        logger.error(error.message);

        res.status(500).json({
            error: "Server error"
        });

    }

});

// =========================
// SYSTEM STATISTICS
// =========================

app.get("/stats", async (req, res) => {

  try {

    const registeredVoters = await User.countDocuments();

    const votesCast = await Vote.countDocuments();

    const election = await ElectionStatus.findOne();

logger.title("SYSTEM STATS");

logger.info(
    "Registered",
    registeredVoters
);

logger.info(
    "Votes",
    votesCast
);

logger.info(
    "Election",
    election?.isOpen ? "OPEN" : "CLOSED"
);

    res.json({

      registeredVoters,

      votesCast,

      electionOpen: election ? election.isOpen : false

    });

  }

  catch (error) {

   logger.error(error.message);

    res.status(500).json({

      error: "Server error"

    });

  }

});

app.get("/users-count", async (req, res) => {

    try {

        const count = await User.countDocuments();

        logger.title("REGISTERED USERS");

        logger.info("Total Registered Users", count);

        await displayDashboard("REGISTERED USERS");

        res.json({
            count
        });

    }

    catch (error) {

        logger.error(error.message);

        res.status(500).json({
            error: "Server error"
        });

    }

});

app.get("/voters-count", async (req, res) => {

    try {

        const count = await Vote.countDocuments();

        logger.title("TOTAL VOTES");

        logger.info("Votes Cast", count);

        await displayDashboard("TOTAL VOTES");

        res.json({
            count
        });

    }

    catch (error) {

        logger.error(error.message);

        res.status(500).json({
            error: "Server error"
        });

    }

});

app.get("/transactions-count", async (req, res) => {

    try {

        const count = await Transaction.countDocuments();

        logger.title("BLOCKCHAIN TRANSACTIONS");

        logger.info("Transactions", count);

        await displayDashboard("BLOCKCHAIN TRANSACTIONS");

        res.json({
            count
        });

    }

    catch (error) {

        logger.error(error.message);

        res.status(500).json({
            error: "Server error"
        });

    }

});

// 🧹 RESET ELECTION

app.delete(
"/reset-votes",
verifyAdmin,
async(req,res)=>{


try{


await Vote.deleteMany({});


await Transaction.deleteMany({});



await User.updateMany(
{},
{
$set:{
hasVoted:false,
wallet:null
}
}
);

logger.admin("RESET ELECTION");

await displayDashboard("RESET ELECTION");

res.json({

message:
"Election reset successfully ✅"

});



}

catch(error){


logger.error(error.message);


res.status(500).json({

error:error.message

});


}


});


app.get("/admin/transactions",
verifyAdmin,
async(req,res)=>{


try{


const transactions =
await Transaction.find();

logger.title("ADMIN VIEWED BLOCKCHAIN");

logger.info(
    "Transactions",
    transactions.length
);

logger.database(
    "All Transactions",
    transactions
);

await displayDashboard("ADMIN VIEWED BLOCKCHAIN");

res.json(transactions);



}

catch(error){

res.status(500).json({

error:error.message

});

}


});

// 🗑️ DELETE USER
app.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    logger.admin("DELETE USER");

await displayDashboard("DELETE USER");

    res.json({ message: "User deleted successfully ✅" });

  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {

    logger.title("VOTECHAIN BLOCKCHAIN SERVER");

    logger.success("Server Started");

    logger.info("Port", PORT);

    logger.info("MongoDB", "Connected");

    logger.info("Blockchain", "Ethereum Sepolia");

    logger.info("Wallet", "MetaMask");

    logger.line();

    await displayDashboard();


});