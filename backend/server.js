
// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');

// dotenv.config();


// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/wishlists', require('./routes/wishlistRoutes'));
// app.use('/api/wishlists', require('./routes/itemRoutes'));

// // Export the app object for testing
// if (require.main === module) {
//     connectDB();
//     // If the file is run directly, start the server
//     const PORT = process.env.PORT || 5001;
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   }


// module.exports = app;
// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db'); // updated import

dotenv.config();

const app = express();

// Hides the details of which middleware is registered and in what order
const registerMiddleware = (app) => {
  app.use(cors());
  app.use(express.json());
};

// Hides the details of route mounting — controllers don't need to know this
const registerRoutes = (app) => {
  app.use('/api/auth',      require('./routes/authRoutes'));
  app.use('/api/wishlists', require('./routes/wishlistRoutes'));
  app.use('/api/wishlists', require('./routes/itemRoutes'));
};

// Single entry point that wires everything together
const initializeApp = (app) => {
  registerMiddleware(app);
  registerRoutes(app);
};

// Boot
initializeApp(app);

if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;