require('dotenv').config(); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT


app.use(express.json());


app.use(express.static(path.join(__dirname, './')));


const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
});


const Course = mongoose.model('Course', courseSchema);


app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

// API endpoint to add a course
app.post('/api/courses', async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const newCourse = new Course({ title, description });
    await newCourse.save();
    res.status(201).json({ message: 'Course added successfully', course: newCourse });
  } catch (error) {
    res.status(500).json({ error: 'Error adding course' });
  }
});



const lectureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
});

const Lecture = mongoose.model('Lecture', lectureSchema);

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST Endpoint: Add Lecture with Optimized Image
app.post('/api/lectures', upload.single('image'), async (req, res) => {
  try {
    const { name, position } = req.body;

    // Ensure an image file is provided
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Optimize the uploaded image using Sharp
    const optimizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 300 }) // Resize image to 300px width (aspect ratio maintained)
      .webp({ quality: 80 }) // Convert to WebP format with 80% quality
      .toBuffer();

    // Create a new lecture with optimized image
    const newLecture = new Lecture({
      name,
      position,
      image: {
        data: optimizedImageBuffer,
        contentType: 'image/webp', // Image is now WebP
      },
    });

    await newLecture.save();

    res.status(201).json({
      message: 'Lecture added successfully',
      lecture: {
        id: newLecture._id,
        name: newLecture.name,
        position: newLecture.position,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding lecture' });
  }
});

// GET Endpoint: Retrieve All Lectures with Base64 Images
app.get('/api/lectures', async (req, res) => {
  try {
    const lectures = await Lecture.find();

    // Convert the image buffer to Base64 format for each lecture
    const lecturesWithImages = lectures.map((lecture) => {
      const imageBase64 = lecture.image?.data
        ? `data:${lecture.image.contentType};base64,${lecture.image.data.toString('base64')}`
        : null;

      return {
        ...lecture.toObject(), // Convert Mongoose document to plain object
        imageUrl: imageBase64, // Include Base64-encoded image
      };
    });

    res.json(lecturesWithImages); // Send the lectures with images
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching lectures' });
  }
});

// GET Endpoint: Retrieve Optimized Image by ID
app.get('/image/:id', async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture || !lecture.image.data) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', lecture.image.contentType);
    res.send(lecture.image.data); // Send the image binary data
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving image');
  }
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
