const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
    // User model will automatically hash the password using bcrypt
    const newUser = new User({ username, password });
    await newUser.save();
    console.log('User registered successfully:', username);
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    res.status(500).send('Error during registration');
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Login attempt failed: User not found', username);
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      console.log('User logged in successfully:', username);
      return res.redirect('/');
    } else {
      console.log('Login attempt failed: Incorrect password for', username);
      return res.status(400).send('Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    if (res.headersSent) {
      return;
    }
    res.status(500).send('Error during login');
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err.message, err.stack);
      if (res.headersSent) {
        return;
      }
      return res.status(500).send('Error logging out');
    }
    console.log('User logged out successfully');
    res.redirect('/auth/login');
  });
});

module.exports = router;