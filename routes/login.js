const express = require('express');
const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const loginRouter = express.Router();
const jwt = require('jsonwebtoken');


loginRouter.post('/', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    const passwordCorrect = user.passwordHash === null
        ? false
        : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
        return res.status(401).json({
            error: 'Invalid username or password'
        });
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    };
    const token = jwt.sign(
        userForToken,
        process.env.JWT_SECRET,
    );

    res
    .status(200).
    send({ token,username: user.username, nickname: user.nickname, interest: user.interest, id: user._id });
});

module.exports = loginRouter;
