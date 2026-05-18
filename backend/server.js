const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { startReminderJob } = require('./services/reminderService');

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
}; // ← this was missing

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