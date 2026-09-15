require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Schema
const initialData = {
  users: [],
  documents: [],
  analyses: [],
  chats: [],
  messages: [],
  mindmaps: [],
  studymaterials: [],
  exports: [],
  activitylogs: [],
  adminpermissions: [],
  systemsettings: []
};

class DatabaseManager {
  constructor() {
    this.data = { ...initialData };
    this.isLoaded = false;
    this.saveTimeout = null;
  }

  async init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...initialData, ...parsed };
      } else {
        this.saveSync();
      }
      this.isLoaded = true;
      await this.seedDefaults();
      console.log('✅ Nexora AI Database initialized successfully');
    } catch (err) {
      console.error('❌ Failed to initialize database, using memory fallback:', err.message);
      this.isLoaded = true;
      await this.seedDefaults();
    }
  }

  save() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveSync();
    }, 150);
  }

  saveSync() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error('Error saving DB to disk:', e.message);
    }
  }

  async seedDefaults() {
    // Seed Super Admin if not present
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'mdshadalam848@gmail.com';
    const existingAdmin = this.data.users.find(u => u.email === superAdminEmail || u.role === 'SUPER_ADMIN');
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'Nexor@Ai', salt);
      const adminId = uuidv4();
      
      const superAdminUser = {
        _id: adminId,
        id: adminId,
        name: process.env.SUPER_ADMIN_NAME || 'Nexora Administrator',
        email: superAdminEmail,
        phone: '+1-800-NEXORA',
        password: passwordHash,
        role: 'SUPER_ADMIN',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.data.users.push(superAdminUser);
      console.log(`👑 Super Admin seeded: ${superAdminEmail}`);
    }

    // Seed Default System Settings if empty
    if (!this.data.systemsettings || this.data.systemsettings.length === 0) {
      this.data.systemsettings = [
        {
          _id: uuidv4(),
          key: 'general',
          platformName: 'Nexora AI',
          tagline: 'Turn Documents Into Knowledge.',
          allowRegistrations: true,
          maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
          defaultAiProvider: process.env.DEFAULT_AI_PROVIDER || 'gemini',
          maintenanceMode: false,
          updatedAt: new Date().toISOString()
        }
      ];
    }

    this.saveSync();
  }

  // Generic collection accessor
  collection(name) {
    const db = this;
    const getCollectionData = () => {
      if (!db.data[name]) db.data[name] = [];
      return db.data[name];
    };

    return {
      find(filter = {}) {
        const collectionData = getCollectionData();
        let results = collectionData.filter(item => {
          for (const key in filter) {
            if (Object.prototype.hasOwnProperty.call(filter, key)) {
              if (filter[key] !== undefined && item[key] !== filter[key]) {
                return false;
              }
            }
          }
          return true;
        });

        // Query chaining helper
        return {
          sort(sortCriteria = {}) {
            results.sort((a, b) => {
              for (const field in sortCriteria) {
                const order = sortCriteria[field];
                if (a[field] < b[field]) return order === 1 ? -1 : 1;
                if (a[field] > b[field]) return order === 1 ? 1 : -1;
              }
              return 0;
            });
            return this;
          },
          limit(n) {
            results = results.slice(0, n);
            return this;
          },
          skip(n) {
            results = results.slice(n);
            return this;
          },
          exec() {
            return JSON.parse(JSON.stringify(results));
          },
          then(resolve, reject) {
            try {
              resolve(JSON.parse(JSON.stringify(results)));
            } catch (err) {
              reject(err);
            }
          }
        };
      },

      findOne(filter = {}) {
        const collectionData = getCollectionData();
        const item = collectionData.find(doc => {
          for (const key in filter) {
            if (Object.prototype.hasOwnProperty.call(filter, key)) {
              if (filter[key] !== undefined && doc[key] !== filter[key]) {
                return false;
              }
            }
          }
          return true;
        });
        return item ? JSON.parse(JSON.stringify(item)) : null;
      },

      findById(id) {
        const collectionData = getCollectionData();
        const item = collectionData.find(doc => doc._id === id || doc.id === id);
        return item ? JSON.parse(JSON.stringify(item)) : null;
      },

      create(doc) {
        const collectionData = getCollectionData();
        const now = new Date().toISOString();
        const id = doc._id || doc.id || uuidv4();
        const newDoc = {
          ...doc,
          _id: id,
          id: id,
          createdAt: doc.createdAt || now,
          updatedAt: now
        };
        collectionData.unshift(newDoc);
        db.save();
        return JSON.parse(JSON.stringify(newDoc));
      },

      findByIdAndUpdate(id, updates, options = { new: true }) {
        const collectionData = getCollectionData();
        const index = collectionData.findIndex(doc => doc._id === id || doc.id === id);
        if (index === -1) return null;
        
        const existing = collectionData[index];
        const updated = {
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        collectionData[index] = updated;
        db.save();
        return JSON.parse(JSON.stringify(updated));
      },

      findByIdAndDelete(id) {
        const collectionData = getCollectionData();
        const index = collectionData.findIndex(doc => doc._id === id || doc.id === id);
        if (index === -1) return null;
        const deleted = collectionData.splice(index, 1)[0];
        db.save();
        return JSON.parse(JSON.stringify(deleted));
      },

      deleteMany(filter = {}) {
        const collectionData = getCollectionData();
        let count = 0;
        for (let i = collectionData.length - 1; i >= 0; i--) {
          const item = collectionData[i];
          let match = true;
          for (const key in filter) {
            if (item[key] !== filter[key]) {
              match = false;
              break;
            }
          }
          if (match) {
            collectionData.splice(i, 1);
            count++;
          }
        }
        if (count > 0) db.save();
        return { deletedCount: count };
      },

      countDocuments(filter = {}) {
        const collectionData = getCollectionData();
        if (Object.keys(filter).length === 0) return collectionData.length;
        return collectionData.filter(item => {
          for (const key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        }).length;
      }
    };
  }
}

const db = new DatabaseManager();

module.exports = {
  db,
  initDB: () => db.init(),
  getCollection: (name) => db.collection(name)
};
