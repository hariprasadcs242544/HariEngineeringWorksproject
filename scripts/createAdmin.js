/**
 * createAdmin.js — Run once to seed / reset the admin user in MongoDB.
 * Usage:  node scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const MONGO_URI = process.env.MONGODB_URI;
const USERNAME  = process.env.ADMIN_USERNAME || 'hariew';
const PASSWORD  = process.env.ADMIN_PASSWORD || 'hariprasad';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  // Remove any existing admin with this username
  await Admin.deleteOne({ username: USERNAME });

  // Create fresh (password is hashed by the pre-save hook)
  const admin = await Admin.create({ username: USERNAME, password: PASSWORD });
  console.log(`\n✅  Admin user created successfully!`);
  console.log(`   Username : ${admin.username}`);
  console.log(`   Password : ${PASSWORD}  (stored as bcrypt hash)`);
  console.log(`\n   Login at: http://localhost:${process.env.PORT || 5000}/admin\n`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
