require('dotenv').config();
const mongoose = require('mongoose');
const dataSyncService = require('./services/data-sync-service');
const syncScheduler = require('./services/sync-scheduler');

// Import database connection
const connectDB = require('./database');

// Import models
require('./User');

async function testSync() {
  try {
    console.log('🔄 Starting sync test...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Test single sync
    console.log('\n=== Testing single sync ===');
    const result = await dataSyncService.syncUserData();
    
    if (result.success) {
      console.log('✅ Single sync completed successfully');
      console.log('📊 Sync results:', result.stats);
    } else {
      console.error('❌ Single sync failed:', result.error);
    }
    
    // Get sync statistics
    console.log('\n=== Sync Statistics ===');
    const stats = dataSyncService.getSyncStats();
    console.log('📈 Current stats:', stats);
    
    // Test scheduler status
    console.log('\n=== Scheduler Status ===');
    const schedulerStatus = syncScheduler.getStatus();
    console.log('⏰ Scheduler status:', schedulerStatus);
    
    console.log('\n✅ Sync test completed successfully!');
    
  } catch (error) {
    console.error('❌ Sync test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the test
testSync();