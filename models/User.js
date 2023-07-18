const mongoose = require('mongoose');
const bcrypt = require('bcrypt') // It allows for secure password storage by applying cryptographic hash functions


const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true 
  },
  nickname: String,
  passwordHash: {
    type: String,
    required: true
  },
  interest: String
})

const User = mongoose.model('User', UserSchema)
module.exports = User
