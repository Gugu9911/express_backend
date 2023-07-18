const express = require('express');
const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const loginRouter = express.Router();


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

    res.status(200).send({ username: user.username, nickname: user.nickname, interest: user.interest });
});

module.exports = loginRouter;
