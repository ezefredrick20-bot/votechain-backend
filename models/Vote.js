const mongoose = require("mongoose");


const voteSchema = new mongoose.Schema({


candidate:{


type:String,

required:true


},



nin:{


type:String,

required:true,

unique:true


},



wallet:{


type:String,

required:true


},



timestamp:{


type:Date,

default:Date.now


}



});



module.exports =
mongoose.model(
"Vote",
voteSchema
);