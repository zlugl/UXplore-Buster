const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'uxplore-buster-secret-2026';

let MONGODB_URI = process.env.MONGODB_URI || '';
if (MONGODB_URI && !MONGODB_URI.includes('/uxplore')) {
  const parts = MONGODB_URI.replace(/\/$/, '').split('?');
  parts[0] = parts[0].replace(/\/$/, '') + '/uxplore';
  MONGODB_URI = parts.join('?');
}
console.log('MongoDB URI (sanitised):', MONGODB_URI.replace(/:([^@]+)@/, ':***@'));


app.use(express.json());

let dbConnected = false;
let dbError = null;





async function connectDB() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set — running without database');
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority',
  };

  try {
    console.log('cnnecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, options);
    dbConnected = true;
    dbError = null;
    console.log('connected to MongoDB');
  } catch (err) {
    dbConnected = false;
    dbError = err.message;
    console.error('mongoDB connection failed:', err.message);

    setTimeout(connectDB, 10000);
  }
}

mongoose.connection.on('connected', () => {
  dbConnected = true;
  dbError = null;
  console.log('mngoDB connected');
});

mongoose.connection.on('disconnected', () => {
  dbConnected = false;
  console.warn('MongoDB disconnected — retrying...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  dbConnected = false;
  dbError = err.message;
  console.error('mongoDB error:', err.message);
});

connectDB();

function requireDb(req, res, next) {
  if (!dbConnected) {
    const msg = dbError
      ? `Database connection error: ${dbError}`
      : 'Database is not connected. Please check your MongoDB Atlas connection and ensure all IPs are whitelisted (0.0.0.0/0).';
    return res.status(503).json({ error: msg });
  }
  next();
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  gameUsername: { type: String, required: true },
  avatar: { type: String, default: '👾' },
  levelProgress: {
    level1: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 } },
    level2: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 } },
    level3: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 } },
    level4: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 } },
    level5: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 } }
  },
  createdAt: { type: Date, default: Date.now }
});
const Profile = mongoose.model('Profile', profileSchema);





function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function formatProfile(p) {
  if (!p) return null;
  return {
    gameUsername: p.gameUsername,
    avatar: p.avatar,
    createdAt: p.createdAt,
    levelProgress: p.levelProgress
  };
}
app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: dbConnected, error: dbError || null });
});
app.post('/api/auth/register', requireDb, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (exists) return res.status(400).json({ error: 'Username already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed });
    await Profile.create({
      userId: user._id,
      gameUsername: username,
      avatar: '👾',
      levelProgress: {
        level1: { completed: false, score: 0 },
        level2: { completed: false, score: 0 },
        level3: { completed: false, score: 0 },
        level4: { completed: false, score: 0 },
        level5: { completed: false, score: 0 }
      }
    });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, user: { id: user._id, username: user.username }, token });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', requireDb, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid username or password' });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    let profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      profile = await Profile.create({
        userId: user._id,
        gameUsername: user.username,
        avatar: '👾',
        levelProgress: {
          level1: { completed: false, score: 0 },
          level2: { completed: false, score: 0 },
          level3: { completed: false, score: 0 },
          level4: { completed: false, score: 0 },
          level5: { completed: false, score: 0 }
        }
      });
    }
    res.json({
      success: true,
      user: { id: user._id, username: user.username },
      token,
      profile: formatProfile(profile)
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/auth/username', requireDb, authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    const exists = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      _id: { $ne: req.user.id }
    });
    if (exists) return res.status(400).json({ error: 'Username already taken' });
    await User.findByIdAndUpdate(req.user.id, { username });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/profile', requireDb, authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json({ profile: formatProfile(profile) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', requireDb, authMiddleware, async (req, res) => {
  try {
    const { gameUsername, avatar, levelProgress } = req.body;
    let profile = await Profile.findOne({ userId: req.user.id });
    if (profile) {
      if (gameUsername) profile.gameUsername = gameUsername;
      if (avatar) profile.avatar = avatar;
      if (levelProgress) profile.levelProgress = levelProgress;
      await profile.save();
    } else {
      profile = await Profile.create({
        userId: req.user.id,
        gameUsername: gameUsername || 'Player',
        avatar: avatar || '👾',
        levelProgress: levelProgress || {
          level1: { completed: false, score: 0 },
          level2: { completed: false, score: 0 },
          level3: { completed: false, score: 0 },
          level4: { completed: false, score: 0 },
          level5: { completed: false, score: 0 }
        }
      });
    }
    res.json({ success: true, profile: formatProfile(profile) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/profile', requireDb, authMiddleware, async (req, res) => {
  try {
    const { gameUsername, avatar } = req.body;
    const update = {};
    if (gameUsername) update.gameUsername = gameUsername;
    if (avatar) update.avatar = avatar;
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: update },
      { new: true }
    );
    res.json({ success: true, profile: formatProfile(profile) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/progress/:levelId', requireDb, authMiddleware, async (req, res) => {
  try {
    const { levelId } = req.params;
    const { score } = req.body;
    const valid = ['level1', 'level2', 'level3', 'level4', 'level5'];
    if (!valid.includes(levelId)) return res.status(400).json({ error: 'Invalid level' });
    const update = { $set: {} };
    update.$set[`levelProgress.${levelId}.completed`] = true;
    update.$set[`levelProgress.${levelId}.score`] = score;
    const defaultProgress = {
      level1: { completed: false, score: 0 },
      level2: { completed: false, score: 0 },
      level3: { completed: false, score: 0 },
      level4: { completed: false, score: 0 },
      level5: { completed: false, score: 0 }
    };
    defaultProgress[levelId] = { completed: true, score };
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      {
        ...update,
        $setOnInsert: {
          gameUsername: req.user.username || 'Player',
          avatar: '👾',
          levelProgress: defaultProgress
        }
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, profile: formatProfile(profile) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/halloffame', requireDb, async (req, res) => {
  try {
    const profiles = await Profile.find().lean();
    const users = profiles.map(p => {
      const lp = p.levelProgress || {};
      const totalScore = Object.values(lp).reduce((sum, l) => sum + (l.completed ? l.score : 0), 0);
      const completedLevels = Object.values(lp).filter(l => l.completed).length;
      return {
        gameUsername: p.gameUsername,
        avatar: p.avatar,
        totalScore,
        completedLevels,
        levelScores: lp
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.use((req, res) => {
  const filePath = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(filePath, (err) => {
    if (err) { res.status(404).sendFile(path.join(__dirname, 'index.html')); return; }
    res.sendFile(filePath);
  });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`seerver running at http://${HOST}:${PORT}/`);
  });
}