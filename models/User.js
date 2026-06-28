const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({


nin:{
type:String,
unique:true,
required:true
},


phone:{
type:String,
unique:true,
required:true
},


firstName:{
type:String,
required:true
},


lastName:{
type:String,
required:true
},


middleName:String,


dob:{
type:String,
required:true
},


hasVoted:{
type:Boolean,
default:false
},


// 🔥 ADD THIS
wallet:{
type:String,
default:null
}


});


module.exports =
mongoose.model(
"User",
userSchema
);