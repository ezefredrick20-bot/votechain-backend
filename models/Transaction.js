const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({

nin:{
type:String,
required:true
},


wallet:{
type:String,
required:true
},


candidate:{
type:String,
required:true
},


hash:{
type:String
},

signature:{
type:String
},


status: {
type: String,
enum: [
"Pending",
"Confirmed",
"Failed"
],
default: "Pending"
},


timestamp:{
type:Date,
default:Date.now
}


});


module.exports =
mongoose.model(
"Transaction",
transactionSchema
);