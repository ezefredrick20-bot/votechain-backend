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
type:String,
required:true
},


signature:{
type:String
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


module.exports =
mongoose.model(
"Transaction",
transactionSchema
);