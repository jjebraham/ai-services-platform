const User = require('../User');
const supabaseConfig = require('../supabase-config');
const { supabase, supabaseAdmin } = supabaseConfig;

class DataSyncService {
  constructor() {
    this.isRunning = false;
    this.lastSyncTime = new Date();
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      errors: 0,
      lastError: null
    };
  }

  async syncUserData() {
    if (this.isRunning) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    console.log(`Starting data sync at ${startTime.toISOString()}`);

    try {
      // Get all users from MongoDB
      const mongoUsers = await User.find({}).lean();
      console.log(`Found ${mongoUsers.length} users in MongoDB`);

      // Get all users from Supabase
      const { data: supabaseUsers, error: supabaseError } = await supabaseAdmin
        .from('user_profiles')
        .select('*');

      if (supabaseError) {
        throw new Error(`Failed to fetch Supabase users: ${supabaseError.message}`);
      }

      console.log(`Found ${supabaseUsers?.length || 0} users in Supabase`);

      // Create maps for efficient lookup
      const mongoUserMap = new Map();
      const supabaseUserMap = new Map();

      mongoUsers.forEach(user => {
        mongoUserMap.set(user.email, user);
      });

      supabaseUsers?.forEach(user => {
        supabaseUserMap.set(user.email, user);
      });

      let syncedCount = 0;
      let createdInSupabase = 0;
      let updatedInSupabase = 0;
      let createdInMongo = 0;
      let updatedInMongo = 0;

      // Sync MongoDB users to Supabase
      for (const mongoUser of mongoUsers) {
        const supabaseUser = supabaseUserMap.get(mongoUser.email);
        
        if (!supabaseUser) {
          // Create user in Supabase
          await this.createUserInSupabase(mongoUser);
          createdInSupabase++;
        } else {
          // Update user in Supabase if needed
          const updated = await this.updateUserInSupabase(mongoUser, supabaseUser);
          if (updated) updatedInSupabase++;
        }
        syncedCount++;
      }

      // Sync Supabase users to MongoDB
      for (const supabaseUser of supabaseUsers || []) {
        const mongoUser = mongoUserMap.get(supabaseUser.email);
        
        if (!mongoUser) {
          // Create user in MongoDB
          await this.createUserInMongo(supabaseUser);
          createdInMongo++;
        } else {
          // Update user in MongoDB if needed
          const updated = await this.updateUserInMongo(supabaseUser, mongoUser);
          if (updated) updatedInMongo++;
        }
      }

      const endTime = new Date();
      const duration = endTime - startTime;

      this.syncStats.totalSyncs++;
      this.syncStats.successfulSyncs++;
      this.lastSyncTime = endTime;

      console.log(`Data sync completed in ${duration}ms`);
      console.log(`Summary: ${createdInSupabase} created in Supabase, ${updatedInSupabase} updated in Supabase`);
      console.log(`Summary: ${createdInMongo} created in MongoDB, ${updatedInMongo} updated in MongoDB`);

      return {
        success: true,
        duration,
        stats: {
          createdInSupabase,
          updatedInSupabase,
          createdInMongo,
          updatedInMongo,
          totalProcessed: syncedCount
        }
      };

    } catch (error) {
      console.error('Data sync failed:', error);
      this.syncStats.errors++;
      this.syncStats.lastError = error.message;
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.isRunning = false;
    }
  }

  async createUserInSupabase(mongoUser) {
    try {
      const userData = {
        email: mongoUser.email,
        full_name: mongoUser.fullName || mongoUser.name || '',
        role: mongoUser.role || 'user',
        is_active: mongoUser.isActive !== false,
        created_at: mongoUser.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mongo_id: mongoUser._id.toString()
      };

      const { error } = await supabaseAdmin
        .from('user_profiles')
        .insert([userData]);

      if (error) {
        throw new Error(`Failed to create user in Supabase: ${error.message}`);
      }

      console.log(`Created user ${mongoUser.email} in Supabase`);
    } catch (error) {
      console.error(`Failed to create user ${mongoUser.email} in Supabase:`, error);
      throw error;
    }
  }

  async updateUserInSupabase(mongoUser, supabaseUser) {
    try {
      const updates = {};
      let hasUpdates = false;

      // Check for differences and prepare updates
      if (mongoUser.fullName && mongoUser.fullName !== supabaseUser.full_name) {
        updates.full_name = mongoUser.fullName;
        hasUpdates = true;
      }

      if (mongoUser.role && mongoUser.role !== supabaseUser.role) {
        updates.role = mongoUser.role;
        hasUpdates = true;
      }

      const isActive = mongoUser.isActive !== false;
      if (isActive !== supabaseUser.is_active) {
        updates.is_active = isActive;
        hasUpdates = true;
      }

      if (hasUpdates) {
        updates.updated_at = new Date().toISOString();
        updates.mongo_id = mongoUser._id.toString();

        const { error } = await supabaseAdmin
          .from('user_profiles')
          .update(updates)
          .eq('email', mongoUser.email);

        if (error) {
          throw new Error(`Failed to update user in Supabase: ${error.message}`);
        }

        console.log(`Updated user ${mongoUser.email} in Supabase`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to update user ${mongoUser.email} in Supabase:`, error);
      throw error;
    }
  }

  async createUserInMongo(supabaseUser) {
    try {
      const userData = {
        email: supabaseUser.email,
        fullName: supabaseUser.full_name || '',
        role: supabaseUser.role || 'user',
        isActive: supabaseUser.is_active !== false,
        createdAt: supabaseUser.created_at ? new Date(supabaseUser.created_at) : new Date(),
        updatedAt: new Date(),
        supabaseId: supabaseUser.id
      };

      const user = new User(userData);
      await user.save();

      console.log(`Created user ${supabaseUser.email} in MongoDB`);
    } catch (error) {
      console.error(`Failed to create user ${supabaseUser.email} in MongoDB:`, error);
      throw error;
    }
  }

  async updateUserInMongo(supabaseUser, mongoUser) {
    try {
      const updates = {};
      let hasUpdates = false;

      // Check for differences and prepare updates
      if (supabaseUser.full_name && supabaseUser.full_name !== mongoUser.fullName) {
        updates.fullName = supabaseUser.full_name;
        hasUpdates = true;
      }

      if (supabaseUser.role && supabaseUser.role !== mongoUser.role) {
        updates.role = supabaseUser.role;
        hasUpdates = true;
      }

      const isActive = supabaseUser.is_active !== false;
      if (isActive !== mongoUser.isActive) {
        updates.isActive = isActive;
        hasUpdates = true;
      }

      if (hasUpdates) {
        updates.updatedAt = new Date();
        updates.supabaseId = supabaseUser.id;

        await User.findByIdAndUpdate(mongoUser._id, updates);

        console.log(`Updated user ${supabaseUser.email} in MongoDB`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to update user ${supabaseUser.email} in MongoDB:`, error);
      throw error;
    }
  }

  getSyncStats() {
    return {
      ...this.syncStats,
      lastSyncTime: this.lastSyncTime,
      isRunning: this.isRunning
    };
  }

  resetStats() {
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      errors: 0,
      lastError: null
    };
  }
}

module.exports = new DataSyncService();