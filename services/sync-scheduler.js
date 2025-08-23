const dataSyncService = require('./data-sync-service');

class SyncScheduler {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.intervalMinutes = 1; // Default to 1 minute
  }

  start(intervalMinutes = 1) {
    if (this.isRunning) {
      console.log('Sync scheduler is already running');
      return;
    }

    this.intervalMinutes = intervalMinutes;
    const intervalMs = intervalMinutes * 60 * 1000; // Convert minutes to milliseconds

    console.log(`Starting sync scheduler - will run every ${intervalMinutes} minute(s)`);
    
    // Run initial sync
    this.runSync();
    
    // Schedule recurring syncs
    this.intervalId = setInterval(() => {
      this.runSync();
    }, intervalMs);

    this.isRunning = true;
  }

  stop() {
    if (!this.isRunning) {
      console.log('Sync scheduler is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('Sync scheduler stopped');
  }

  async runSync() {
    try {
      console.log('\n=== Starting scheduled data sync ===');
      const result = await dataSyncService.syncUserData();
      
      if (result.success) {
        console.log('✅ Scheduled sync completed successfully');
        if (result.stats) {
          console.log('📊 Sync statistics:', result.stats);
        }
      } else {
        console.error('❌ Scheduled sync failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Scheduled sync encountered an error:', error);
    }
    console.log('=== Scheduled data sync finished ===\n');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.intervalMinutes,
      nextSyncIn: this.isRunning ? `${this.intervalMinutes} minute(s)` : 'Not scheduled',
      syncStats: dataSyncService.getSyncStats()
    };
  }

  // Manual trigger for testing
  async triggerSync() {
    console.log('🔄 Manually triggering data sync...');
    return await this.runSync();
  }
}

module.exports = new SyncScheduler();