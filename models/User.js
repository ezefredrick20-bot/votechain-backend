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




// wallet connected to this user

wallet:{


type:String,

default:null


},



// used for one person one vote

hasVoted:{


type:Boolean,


default:false


}



});



module.exports =
mongoose.model(
"User",
userSchema
);