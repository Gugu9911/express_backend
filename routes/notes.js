const express = require('express');
const Notesrouter = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Likerouter = express.Router();


// const { default: note } = require('../../react_frontend/src/services/note');
const upload = multer({ dest: 'uploads/' }); 
require('dotenv').config()


const USER_FIELDS = { username: 1, name: 1 };
Notesrouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', USER_FIELDS);
  res.json(notes);
})

Notesrouter.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id).populate('user', USER_FIELDS);
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
})

Notesrouter.get('/users/:id', async (req, res) => {
  const notes = await Note.find({ user: req.params.id }).populate('user', USER_FIELDS);
  if (notes) {
    res.json(notes);
  } else {
    res.status(404).end();
  }
});

Notesrouter.post('/', upload.array('images'), async (request, response) =>{
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET)


  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  if (!body.title) {
    return response.status(400).end()
  }

  const user = await User.findById(decodedToken.id)


  // Upload the files to Cloudinary
  let imageUrls = [];
  if (request.files) {
    for (let file of request.files) {
      const result = await cloudinary.uploader.upload(file.path)
      imageUrls.push(result.secure_url);
    }
  }
  
  const note = new Note({
    title: body.title,
    author: user.nickname,
    content: body.content,
    imageurl: imageUrls,
    user : user._id
  })
  

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.json(savedNote)
})


Notesrouter.put('/:id', upload.array('images'), async (request, response) => {
  const body = request.body;
  const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }

  const note = await Note.findById(request.params.id);

  if(!note) {
    return response.status(404).json({ error: 'note not found' });
  }

  if (note.user.toString() !== decodedToken.id.toString()) {
    return response.status(401).json({ error: 'only the creator can update notes' });
  }

  let imageUrls = note.imageurl || [];
  // Handle image deletions
  if (body.deleteImageURLs) {
    const urlsToDelete = Array.isArray(body.deleteImageURLs) ? body.deleteImageURLs : [body.deleteImageURLs];
    imageUrls = imageUrls.filter(url => !urlsToDelete.includes(url));
  }
  // Upload the files to Cloudinary
  if (request.files) {
      for (let file of request.files) {
          const result = await cloudinary.uploader.upload(file.path);
          imageUrls.push(result.secure_url);
      }
  }
  
  const newNote = {
      title: body.title,
      content: body.content,
      imageurl: imageUrls,
      user: body.user
  };

  const savedNote = await Note.findByIdAndUpdate(request.params.id, newNote, { new: true });
  response.json(savedNote);
});


Notesrouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET);
  const note = await Note.findById(request.params.id);
  if (note.user.toString() !== decodedToken.id.toString()) {
    return response.status(401).json({ error: 'only the creator can delete notes' });
  }
  if (!note) {
    return response.status(404).json({ error: 'note not found' });
  }
  await Note.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = Notesrouter;
