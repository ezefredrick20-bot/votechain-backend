const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({

  hash:{
    type:String,
    required:true
  },


  candidate:{
    type:String,
    required:true
  },


  nin:{
    type:String,
    required:true
  },


  status:{
    type:String,
    default:"Confirmed"
  },


  timestamp:{
    type:Date,
    default:Date.now
  }


});


module.exports = mongoose.model(
"Transaction",
transactionSchema
);