const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

async function createAdmin(name, email, password, role = 'ADMIN') {
  if (!fs.existsSync(DB_FILE)) {
    console.error('Database file not found at:', DB_FILE);
    console.error('Please run the server at least once or create server/data/db.json');
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  const db = JSON.parse(raw);

  if (!db.users) db.users = [];
  if (!db.adminpermissions) db.adminpermissions = [];

  const cleanEmail = email.toLowerCase().trim();
  const existingIndex = db.users.findIndex(u => u.email && u.email.toLowerCase() === cleanEmail);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  if (existingIndex !== -1) {
    // Update existing user to admin
    db.users[existingIndex].name = name.trim();
    db.users[existingIndex].password = passwordHash;
    db.users[existingIndex].role = role;
    db.users[existingIndex].status = 'active';
    console.log(`\nUpdated existing account [${cleanEmail}] to role: ${role}`);
  } else {
    // Create new admin
    const newId = uuidv4();
    const newUser = {
      _id: newId,
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      password: passwordHash,
      role: role,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);

    // Grant permissions
    db.adminpermissions.push({
      _id: uuidv4(),
      userId: newId,
      permissions: ['VIEW_USERS', 'VIEW_DOCUMENTS', 'VIEW_ANALYTICS', 'VIEW_ACTIVITY_LOGS'],
      assignedBy: 'cli-script',
      createdAt: new Date().toISOString()
    });

    console.log(`\nCreated new administrator account: [${cleanEmail}] with role: ${role}`);
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  console.log('Admin account successfully saved to database!');
  console.log(`Login Email: ${cleanEmail}`);
  console.log(`Role: ${role}`);
  console.log('You can now log in at: http://localhost:5000/admin\n');
}

// Check if arguments provided via command line: node add-admin.js "Name" "email" "password" [SUPER_ADMIN|ADMIN]
const args = process.argv.slice(2);
if (args.length >= 3) {
  const [name, email, password, role] = args;
  createAdmin(name, email, password, role || 'ADMIN').then(() => process.exit(0));
} else {
  // Interactive prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('===================================================');
  console.log('         NEXORA AI - Create / Promote Admin         ');
  console.log('===================================================');

  rl.question('Admin Full Name: ', (name) => {
    if (!name.trim()) {
      console.log('Name cannot be empty.');
      rl.close();
      return;
    }
    rl.question('Admin Email: ', (email) => {
      if (!email.trim()) {
        console.log('Email cannot be empty.');
        rl.close();
        return;
      }
      rl.question('Admin Password (min 6 characters): ', (password) => {
        if (!password || password.length < 6) {
          console.log('Password must be at least 6 characters.');
          rl.close();
          return;
        }
        rl.question('Role (1: ADMIN, 2: SUPER_ADMIN) [Default: 1]: ', async (roleChoice) => {
          const role = roleChoice.trim() === '2' ? 'SUPER_ADMIN' : 'ADMIN';
          await createAdmin(name, email, password, role);
          rl.close();
        });
      });
    });
  });
}
