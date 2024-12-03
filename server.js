const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const sharp = require('sharp');

dotenv.config();

const app = express();
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, './')));


const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

  const CourseSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      entryRequirements: { type: String, default: 'Not Specified' },
      commencement: { type: String, default: 'Not Specified' },
      courseStructureAndModules: { type: String, default: 'Not Specified' }
  });
  
  const Course = mongoose.model('Course', CourseSchema);
  
  module.exports = Course;
  


app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

app.post('/api/courses', async (req, res) => {
  const { title, description, entryRequirements = "Anyone", commencement, courseStructureAndModules } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const newCourse = new Course({
      title,
      description,
      entryRequirements,
      commencement,
      courseStructureAndModules,
    });
    await newCourse.save(); // Save the new course to the database
    res.status(201).json({ message: 'Course added successfully', course: newCourse });
  } catch (error) {
    res.status(500).json({ error: 'Error adding course' }); // Handle server errors
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


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'm.mohamed.shinan@gmail.com',
    pass: 'whyd uywx twpr luwu',
  },
});


app.post('/submit-admission', async (req, res) => {
  const {
    academicDetails,
    firstName,
    lastName,
    gender,
    dob,
    mobile,
    email,
    address,
    guardianRelation,
    guardianName,
    guardianMobile,
  } = req.body;

  const mailOptions = {
    from: 'm.mohamed.shinan@gmail.com',
    to: 'm.mohamed.shinan@gmail.com',
    subject: 'New Admission Form Submission',
    html: `
      <h2>Admission Form Submission</h2>
      <h2>Admission Form Submission</h2>
      <h3>Academic Details</h3>
      <p><strong>School Name:</strong> ${academicDetails.schoolName}</p>
      <p><strong>Class:</strong> ${academicDetails.class}</p>
      <p><strong>Section:</strong> ${academicDetails.section}</p>
      <h3>Student Details</h3>
      <p><strong>First Name:</strong> ${firstName}</p>
      <p><strong>Last Name:</strong> ${lastName}</p>
      <p><strong>Gender:</strong> ${gender}</p>
      <p><strong>Date of Birth:</strong> ${dob}</p>
      <p><strong>Mobile Number:</strong> ${mobile}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Address:</strong> ${address}</p>

      <h3>Guardian Details</h3>
      <p><strong>Relation:</strong> ${guardianRelation}</p>
      <p><strong>Guardian Name:</strong> ${guardianName}</p>
      <p><strong>Guardian Mobile:</strong> ${guardianMobile}</p>
    `,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
