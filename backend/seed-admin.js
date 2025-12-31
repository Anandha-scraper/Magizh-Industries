// Usage: node seed-admin.js
const { db, auth } = require('./config/firebase');
const { generateCredentials } = require('./utils/generate');
require('dotenv').config();

async function seedAdmin() {
  try {
    console.log(' Seeding admin to Firebase Cloud...\n');

    // Get admin details from .env
    const firstName = process.env.ADMIN_FIRSTNAME;
    const lastName = process.env.ADMIN_LASTNAME;
    const fatherName = process.env.ADMIN_FATHERNAME;
    const dob = process.env.ADMIN_DOB;
    const email = process.env.ADMIN_EMAIL;

    // Validate required fields
    if (!firstName || !lastName || !fatherName || !dob || !email) {
      throw new Error('Missing admin details in .env file.');
    }

    // Generate credentials
    const { generatedUserId, generatedPassword } = generateCredentials(
      firstName,
      lastName,
      fatherName,
      dob
    );

    // Check if admin already exists
    const existingAdmin = await db.collection('users')
      .where('userId', '==', generatedUserId)
      .get();

    if (!existingAdmin.empty) {
      console.log('  Admin user found already\n');
      return;
    }

    // Show generated credentials for new admin
    console.log('📋 Generated Credentials:');
    console.log(`   UserId: ${generatedUserId}`);
    console.log(`   Password: ${generatedPassword}\n`);

    // Step 1: Create user in Firebase Authentication
    console.log('Creating user in Firebase Auth...');
    const userRecord = await auth.createUser({
      email: email,
      password: generatedPassword,
      displayName: `${firstName} ${lastName}`
    });

    // Step 2: Create admin user document in Firestore
    console.log('Creating user profile in Firestore...');
    const adminData = {
      firstName,
      lastName,
      fatherName,
      dob,
      email,
      userId: generatedUserId,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    };

    // Add to Firestore using the Auth UID as document ID
    await db.collection('users').doc(userRecord.uid).set(adminData);

    console.log('✅ Admin seeded successfully!\n');

  } catch (error) {
    console.error('Seeding failed:', error.message);
    throw error;
  }
}

// Run the seeder
seedAdmin()
  .then(() => {
    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
