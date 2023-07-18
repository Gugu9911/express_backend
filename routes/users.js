const userRouter = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')

userRouter.post('/', async (req, res) => {
  const { username, nickname, password, interest } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already registered' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create a new user instance
    const user = new User({ 
      username,
      nickname,
      interest,
      passwordHash
    });

    // Save the user to the database
    await user.save();

    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = userRouter
