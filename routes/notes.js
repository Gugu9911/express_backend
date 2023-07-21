const express = require('express');
const Notesrouter = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // adjust this to your needs

const getTokenFrom = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  } else {
    request.token = null
  }
  next()
}
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

Notesrouter.post('/', getTokenFrom, upload.array('images'), async (request, response) =>{
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

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
    for (const file of request.files) {
      const result = await cloudinary.uploader.upload(file.path)
      imageUrls.push(result.secure_url);
    }
  }
  const note = new Note({
    title: body.title,
    author: user.name,
    content: body.content,
    imagesurl: imageUrls,
    user : user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.json(savedNote)
})

module.exports = Notesrouter;
