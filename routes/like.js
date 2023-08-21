const express = require('express');
const Likerouter = express.Router();
const Note = require('../models/Note');
const Like = require('../models/Like');


// User clicks the like button
Likerouter.post('/:noteId', async (req, res) => {
    const noteId = req.params.noteId;
    const userId = req.body.userId; // This should be passed from the frontend and would typically come from the authenticated user's info.
  
    try {
      // Check if a like already exists for this user and note.
      const like = await Like.findOne({ note: noteId, user: userId });
      if (like) {
        // User has liked it before. Remove the like.
        await Like.deleteOne({ _id: like._id });
        return res.status(200).json({ message: "Like removed" });
      } else {
        // No like exists. Create a new like.
        const newLike = new Like({
          user: userId,
          note: noteId
        });
        await newLike.save();
        return res.status(200).json({ message: "Like added" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

Likerouter.get('/:noteId', async (req, res) => {
    try {
      const noteId = req.params.noteId;
      const likesCount = await Like.countDocuments({ note: noteId });
      return res.status(200).json({ likesCount });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  Likerouter.get('/:noteId/user/:userId', async (req, res) => {
    const noteId = req.params.noteId;
    const userId = req.params.userId;

    try {
        const like = await Like.findOne({ note: noteId, user: userId });
        if (like) {
            return res.status(200).json({ isLiked: true });
        } else {
            return res.status(200).json({ isLiked: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = Likerouter;
