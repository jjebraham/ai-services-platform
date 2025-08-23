const express = require('express');
const router = express.Router();
const dataSyncService = require('../services/data-sync-service');
const syncScheduler = require('../services/sync-scheduler');

// Get sync status and statistics
router.get('/status', (req, res) => {
  try {
    const schedulerStatus = syncScheduler.getStatus();
    res.json({
      success: true,
      data: schedulerStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Manually trigger a sync
router.post('/trigger', async (req, res) => {
  try {
    console.log('Manual sync triggered via API');
    await syncScheduler.triggerSync();
    
    res.json({
      success: true,
      message: 'Sync triggered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the scheduler
router.post('/start', (req, res) => {
  try {
    const { intervalMinutes = 1 } = req.body;
    syncScheduler.start(intervalMinutes);
    
    res.json({
      success: true,
      message: `Sync scheduler started with ${intervalMinutes} minute interval`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop the scheduler
router.post('/stop', (req, res) => {
  try {
    syncScheduler.stop();
    
    res.json({
      success: true,
      message: 'Sync scheduler stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reset sync statistics
router.post('/reset-stats', (req, res) => {
  try {
    dataSyncService.resetStats();
    
    res.json({
      success: true,
      message: 'Sync statistics reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get detailed sync logs (last 10 sync attempts)
router.get('/logs', (req, res) => {
  try {
    const stats = dataSyncService.getSyncStats();
    
    res.json({
      success: true,
      data: {
        syncStats: stats,
        schedulerStatus: syncScheduler.getStatus()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;