const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Assuming you have auth middleware
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};


// Middleware for image uploading
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'notes',
      format: async (req, file) => {
        // get the original extension and return it
        return path.extname(file.originalname);
      }, 
      public_id: (req, file) => {
        // get the original name and remove the extension
        return path.basename(file.originalname, path.extname(file.originalname));
      },
    },
  });
  const parser = multer({ storage: storage });
  

// Get all notes for a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId); 
    if (!user) return res.status(404).json({msg: 'User not found'});
    
    const notes = await Note.find({ user: req.params.userId });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a specific note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({msg: 'Note not found'});
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new note
router.post('/', [auth, parser.array("images", 5)], async (req, res) => {
  try {
    const newNote = new Note({
      title: req.body.title,
      content: req.body.content,
      images: req.files.map(file => file.path),
      user: req.body.user 
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a note
router.put('/:id', [auth, parser.array("images", 5)], async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({msg: 'Note not found'});

    note = await Note.findByIdAndUpdate(
      req.params.id, 
      { 
        title: req.body.title,
        content: req.body.content,
        images: req.files.map(file => file.path),
      }, 
      { new: true }
    );

    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({msg: 'Note not found'});

    await Note.findByIdAndRemove(req.params.id);

    res.json({msg: 'Note removed'});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
