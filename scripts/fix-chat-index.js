require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function dropOldIndex() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  try {
    const result = await mongoose.connection.db.collection('chats').dropIndex('userId_1');
    console.log('Dropped old userId_1 unique index:', result);
  } catch (e) {
    console.log('Index userId_1 not found (already dropped or never existed):', e.message);
  }

  await mongoose.disconnect();
  console.log('Done! You can now restart the dev server.');
}

dropOldIndex();
