const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  candidate: String,
  nin: {
    type: String,
    required: true,
    unique: true, // 🔥 VERY IMPORTANT
  },
});

module.exports = mongoose.model("Vote", voteSchema);