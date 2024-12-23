const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const User = require('../model/user'); // Ensure the path to the User model is correct
const Course = require('../model/course'); // Ensure the path to the Course model is correct
const Commission = require('../model/commission'); // Optional, based on your logic

app.use(express.json());

// Handle real-time connections
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API to handle sales
app.post('/api/commissionsales', async (req, res) => {
  try {
    const { userId, courseId, salesCount } = req.body;

    // Ensure all required data is provided
    if (!userId || !courseId || !salesCount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ error: 'User or course not found' });
    }

    // Calculate commission
    const commissionAmount = salesCount * course.price * 0.4;

    // Update user metrics
    user.todaySales += salesCount;
    user.overallSales += salesCount;
    user.todayEarnings += commissionAmount;
    user.overallEarnings += commissionAmount;

    // Update affiliate earnings if applicable
    if (user.affiliateId) {
      const affiliate = await User.findById(user.affiliateId);
      if (affiliate) {
        affiliate.todayAffiliateEarnings += commissionAmount;
        affiliate.overallAffiliateEarnings += commissionAmount;
        await affiliate.save();
      }
    }

    await user.save();

    // Emit updated metrics to all connected clients
    io.emit('metrics-update', {
      userId: user._id, // Include the user ID for tracking
      newEarnings: user.overallEarnings,
      newSales: user.overallSales,
    });

    res.status(200).json({ message: 'Sale recorded successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = 3000; // Replace with your preferred port
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
