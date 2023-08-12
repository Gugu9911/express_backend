const express = require('express');
const Likerouter = express.Router();
const Note = require('../models/Note');
const Like = require('../models/Like');


// User clicks the like button
Likerouter.post('/like/:noteId', async (req, res) => {
  const noteId = req.params.noteId;
  const userId = req.body.userId; // This should be passed from the frontend and would typically come from the authenticated user's info.

  try {
    // Check if a like already exists for this user and note.
    let like = await Like.findOne({ note: noteId, user: userId });
    if (like) {
      // User has liked it before. Remove the like.
      await like.remove();
      return res.status(200).json({ message: "Like removed" });
    } else {
      // No like exists. Create a new like.
      like = new Like({
        user: userId,
        note: noteId
      });
      await like.save();
      return res.status(200).json({ message: "Like added" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

Likerouter.get('/likes/:noteId', async (req, res) => {
    try {
      const noteId = req.params.noteId;
      const likesCount = await Like.countDocuments({ note: noteId });
      return res.status(200).json({ likesCount });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  


// Likerouter.put('/:id', async (req, res) => {
//     if (!req.user) {
//         console.log('User not authenticated');
//         return res.status(401).send({ error: 'Unauthorized' });
//     }
    
//     const userId = req.user._id;
//     console.log('User ID from the request:', userId);

//     try {
//         const note = await Note.findById(req.params.id);
//         console.log('Found note:', note);

//         if (!note) {
//             return res.status(404).send({ error: 'Note not found' });
//         }

//         let likeEntry = await Like.findOne({ user: userId, note: req.params.id });
//         console.log('Like entry for user:', likeEntry);

//         if (likeEntry) {
//             await likeEntry.remove();
//             note.likesCount--;
//         } else {
//             await Like.create({ user: userId, note: req.params.id, liked: true });
//             note.likesCount++;
//         }

//         await note.save();

//         res.send({
//             ...note._doc,
//             liked: Boolean(likeEntry),
//             likesCount: note.likesCount
//         });

//     } catch (error) {
//         console.error('Error in like route:', error.message);
//         if (error.name === 'ValidationError') {
//             return res.status(400).send({ error: 'Validation error' });
//         }
//         res.status(500).send({ error: 'Server error' });
//     }
// });




module.exports = Likerouter;
