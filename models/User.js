const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nin: { type: String, unique: true },
  phone: { type: String, unique: true },
  firstName: String,
  lastName: String,
  middleName: String,
  dob: String,
});

module.exports = mongoose.model("User", userSchema);