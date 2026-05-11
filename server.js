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
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI not set — running in localStorage-only mode');
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

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (exists) return res.status(400).json({ error: 'Username already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, user: { id: user._id, username: user.username }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid username or password' });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    const profile = await Profile.findOne({ userId: user._id });
    res.json({
      success: true,
      user: { id: user._id, username: user.username },
      token,
      profile: formatProfile(profile)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/auth/username', authMiddleware, async (req, res) => {
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

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json({ profile: formatProfile(profile) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', authMiddleware, async (req, res) => {
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

app.patch('/api/profile', authMiddleware, async (req, res) => {
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

app.post('/api/progress/:levelId', authMiddleware, async (req, res) => {
  try {
    const { levelId } = req.params;
    const { score } = req.body;
    const valid = ['level1', 'level2', 'level3', 'level4', 'level5'];
    if (!valid.includes(levelId)) return res.status(400).json({ error: 'Invalid level' });
    const update = {};
    update[`levelProgress.${levelId}.completed`] = true;
    update[`levelProgress.${levelId}.score`] = score;
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

app.get('/api/halloffame', async (req, res) => {
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

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

app.use((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(__dirname, decodeURIComponent(urlPath));
  fs.readFile(filePath, (err, data) => {
    if (err) { res.status(404).send('404 Not Found'); return; }
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.send(data);
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
