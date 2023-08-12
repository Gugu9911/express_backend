const express = require('express');
const Searchrouter = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');

Searchrouter.get('/', async (req, res) => {
    
    const searchTerm = req.query.term;

    if (!searchTerm) {
        return res.status(400).send({ error: "Search term is required" });
    }

    try {
        // Search notes based on the term in title and content
        const notesFromTerm = await Note.find({
            $or: [
                { author: new RegExp(searchTerm, 'i')},
                { title: new RegExp(searchTerm, 'i') },
                { content: new RegExp(searchTerm, 'i') }
            ]
        });

        // Search for users matching the term, perhaps in a 'name' or 'username' field
        const users = await User.find({ 
            $or: [
                { nickname: new RegExp(searchTerm, 'i') },
                { username: new RegExp(searchTerm, 'i') }
            ]
        });

        // Get notes related to the found users (assuming notes have a 'userId' field to relate to users)
        const userIds = users.map(user => user._id);
        const notesFromUsers = await Note.find({ userId: { $in: userIds } });

        // Combine and deduplicate notes
        const combinedNotes = [...new Set([...notesFromTerm, ...notesFromUsers])];

        return res.status(200).send(combinedNotes);
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).send({ error: "An error occurred while searching" });
    }
});

module.exports = Searchrouter;
