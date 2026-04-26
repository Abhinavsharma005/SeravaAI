/**
 * Seed Dummy Mood Data for Stress Dashboard
 * Usage: node scripts/seed-moods.js <your_uid>
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define minimal schemas for the script
const MoodIndicatorSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  counts: { type: Map, of: Number },
  history: [{
    emoji: String,
    source: String,
    timestamp: Date
  }]
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  uid: String,
  email: String
});

const MoodIndicator = mongoose.models.MoodIndicator || mongoose.model('MoodIndicator', MoodIndicatorSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const VALID_EMOJIS = ["😄", "🙂", "😐", "😕", "😢", "😭"];

async function seedData() {
  const uid = process.argv[2];
  if (!uid) {
    console.error('❌ Error: Please provide a UID as an argument.');
    console.log('Example: node scripts/seed-moods.js ABC123XYZ');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ Error: MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('🚀 Connected to MongoDB');

    // Search by Firebase UID OR MongoDB _id
    const user = await User.findOne({ 
      $or: [
        { uid: uid },
        { _id: mongoose.Types.ObjectId.isValid(uid) ? uid : null }
      ]
    });
    if (!user) {
      console.error(`❌ User with UID "${uid}" not found in database.`);
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.email} (${user._id})`);

    // Prepare dummy history for past 7 days
    const history = [];
    const counts = { "😄": 0, "🙂": 0, "😐": 0, "😕": 0, "😢": 0, "😭": 0 };

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random number of entries per day (1-3)
      const entriesPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < entriesPerDay; j++) {
        const randomEmoji = VALID_EMOJIS[Math.floor(Math.random() * VALID_EMOJIS.length)];
        const entryDate = new Date(date);
        entryDate.setHours(9 + j * 4, Math.floor(Math.random() * 60)); // Spread entries during the day
        
        history.push({
          emoji: randomEmoji,
          source: 'manual',
          timestamp: entryDate
        });
        counts[randomEmoji]++;
      }
    }

    console.log(`📊 Generated ${history.length} mood entries for the past 7 days.`);

    // Upsert the MoodIndicator document
    await MoodIndicator.findOneAndUpdate(
      { userId: user._id },
      { 
        $set: { 
          history: history.sort((a, b) => b.timestamp - a.timestamp),
          counts: counts
        } 
      },
      { upsert: true, new: true }
    );

    console.log('✅ Successfully seeded mood data!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedData();
