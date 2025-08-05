const Settings = require('./Settings');
const CMSPage = require('./CMSPage');

// Initialize application with default data
const initializeApp = async () => {
  try {
    console.log('Initializing application...');
    
    // Initialize default settings
    await Settings.initializeDefaults();
    console.log('Default settings initialized');
    
    // Initialize default CMS pages
    await CMSPage.initializeDefaults();
    console.log('Default CMS pages initialized');
    
    console.log('Application initialization completed successfully');
  } catch (error) {
    console.error('Application initialization failed:', error);
    throw error;
  }
};

module.exports = {
  initializeApp
};