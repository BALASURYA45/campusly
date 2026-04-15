require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const COMMON_EMAIL = process.env.FROM_EMAIL || 'balasuryad13062006@gmail.com';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
    if (existingAdmin) {
      console.log('✓ Admin account already exists. Skipping creation...');
      console.log('Admin Details:');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Role: ${existingAdmin.role}`);
      await mongoose.connection.close();
      return;
    }

    const adminData = {
      name: 'Admin User',
      email: COMMON_EMAIL,
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
    };

    const admin = await User.create(adminData);
    console.log('✓ Admin account created successfully!');
    console.log('\n=== Admin Credentials ===');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: Admin@123`);
    console.log(`Role: ${admin.role}`);
    console.log('\nYou can now login with these credentials.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('Email already exists in database.');
    }
    process.exit(1);
  }
};

seedAdmin();
