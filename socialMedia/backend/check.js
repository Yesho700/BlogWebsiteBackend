const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/nodejs_assignment', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', {
  email: String,
  phone: String,
  name: String,
  profileImage: String,
  password: String,
  role: { type: String, default: 'User' },
});

// Middleware for authentication
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { email, phone, name, profileImage, password } = req.body;

    // Validate input (you should implement proper validation)

    // Check if the email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the database
    const user = new User({ email, phone, name, profileImage, password: hashedPassword });
    await user.save();

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Find user in the database
    const user = await User.findOne({ $or: [{ email }, { phone }] });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protect routes with authentication middleware
app.use(authenticateUser);

// Modify User Details
app.put('/user', async (req, res) => {
  try {
    const { name, profileImage } = req.body;
    const userId = req.userId;

    // Users can only modify their own name and profile image
    await User.findByIdAndUpdate(userId, { name, profileImage });

    res.json({ message: 'User details updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete User
app.delete('/user', async (req, res) => {
  try {
    const userId = req.userId;

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
