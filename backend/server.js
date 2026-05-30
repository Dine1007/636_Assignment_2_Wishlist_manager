const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { startReminderJob } = require('./services/reminderService');
//const { sendExpiryReminders } = require('./services/reminderService');
dotenv.config();

const app = express();

const registerMiddleware = (app) => {
  app.use(cors());
  app.use(express.json());
};

const registerRoutes = (app) => {
  app.use('/api/auth',      require('./routes/authRoutes'));
  app.use('/api/wishlists', require('./routes/wishlistRoutes'));
  app.use('/api/wishlists', require('./routes/itemRoutes'));
  
// Health check route — required for ALB
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', server: require('os').hostname() });
});
   //DEMO ROUTE — shows email reminder working live
  // app.get('/test-reminders', async (req, res) => {
  //   try {
  //     await sendExpiryReminders();
  //     res.json({ message: 'Reminder check ran — check your email and console logs.' });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // });
}; 

const initializeApp = (app) => {
  registerMiddleware(app);
  registerRoutes(app);
};

initializeApp(app);

if (require.main === module) {
  connectDB().then(() => {
    startReminderJob();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;