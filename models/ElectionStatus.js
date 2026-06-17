const mongoose = require("mongoose");

const ElectionStatusSchema = new mongoose.Schema({
  isOpen: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model(
  "ElectionStatus",
  ElectionStatusSchema
);