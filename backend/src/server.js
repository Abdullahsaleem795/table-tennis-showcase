const app = require('./app');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const userService = require('./services/userService');
const bcrypt = require('bcryptjs');



dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  // Seed default admin user if none exists
  try {
    const adminCount = await userService.count();
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('AdminPassword123!', salt);
      await userService.create({
        username: 'admin',
        password: hashedPassword
      });
      console.log('Seeded default admin user: admin / AdminPassword123!');
    }
  } catch (err) {
    console.error('Error seeding default administrator:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

startServer();
