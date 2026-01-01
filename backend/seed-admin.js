require('dotenv').config();
const { db, auth } = require('./config/firebase');
const bcrypt = require('bcryptjs');

const adminData = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  firstName: process.env.ADMIN_FIRST_NAME,
  lastName: process.env.ADMIN_LAST_NAME,
  fatherName: process.env.ADMIN_FATHER_NAME,
  dob: process.env.ADMIN_DOB,
  userId: process.env.ADMIN_USER_ID,
  role: 'admin'
};

async function seedAdmin() {
  try {
    if (!adminData.email || !adminData.password || !adminData.firstName || !adminData.lastName || !adminData.userId) {
      throw new Error('Missing required environment variables. Please set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME, and ADMIN_USER_ID in .env file');
    }

    if (adminData.password.length < 6) {
      throw new Error('ADMIN_PASSWORD must be at least 6 characters long');
    }

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(adminData.email);
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      if (userDoc.exists) {
        console.log('Admin User already exists..');
        return;
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    if (!userRecord) {
      userRecord = await auth.createUser({
        email: adminData.email,
        password: adminData.password,
        displayName: `${adminData.firstName} ${adminData.lastName}`,
        emailVerified: true
      });
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    await db.collection('users').doc(userRecord.uid).set({
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      fatherName: adminData.fatherName,
      dob: adminData.dob,
      email: adminData.email,
      userId: adminData.userId,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isApproved: true,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('Admin Created with Admin Creds');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

seedAdmin();
