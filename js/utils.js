const API_BASE = '/api';

async function apiCall(method, endpoint, data, token) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(API_BASE + endpoint, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });
    return await res.json();
  } catch (err) {
    console.warn('API call failed:', endpoint, err.message);
    return null;
  }
}

const StorageManager = {
  getToken() {
    return localStorage.getItem('uxplore_token');
  },

  setToken(token) {
    localStorage.setItem('uxplore_token', token);
  },

  removeToken() {
    localStorage.removeItem('uxplore_token');
  },

  getUser() {
    const user = localStorage.getItem('uxplore_user');
    return user ? JSON.parse(user) : null;
  },

  setUser(userData) {
    localStorage.setItem('uxplore_user', JSON.stringify(userData));
  },

  removeUser() {
    localStorage.removeItem('uxplore_user');
  },

  userExists(username) {
    const users = JSON.parse(localStorage.getItem('uxplore_users') || '[]');
    return users.some(u => u.username.toLowerCase() === username.toLowerCase());
  },

  async registerUser(username, password) {
    const result = await apiCall('POST', '/auth/register', { username, password });
    if (result && result.success) {
      this.setToken(result.token);
      this.setUser(result.user);
      const users = JSON.parse(localStorage.getItem('uxplore_users') || '[]');
      users.push(result.user);
      localStorage.setItem('uxplore_users', JSON.stringify(users));
      return { success: true, user: result.user };
    }
    return { success: false, error: result?.error || 'Registration failed' };
  },

  async loginUser(username, password) {
    const existingLocalProfile = this.getProfile();
    const result = await apiCall('POST', '/auth/login', { username, password });
    if (result && result.success) {
      this.setToken(result.token);
      this.setUser(result.user);
      let finalProfile = result.profile;
      if (result.profile && existingLocalProfile && existingLocalProfile.levelProgress) {
        const serverLP = result.profile.levelProgress || {};
        const localLP = existingLocalProfile.levelProgress || {};
        const mergedLP = { ...serverLP };
        Object.keys(localLP).forEach(lvl => {
          const local = localLP[lvl];
          const server = serverLP[lvl] || { completed: false, score: 0 };
          if (local.completed && (!server.completed || local.score > server.score)) {
            mergedLP[lvl] = local;
          }
        });
        finalProfile = { ...result.profile, levelProgress: mergedLP };
        apiCall('POST', '/profile', {
          gameUsername: finalProfile.gameUsername,
          avatar: finalProfile.avatar,
          levelProgress: mergedLP
        }, result.token).catch(() => {});
      }
      if (finalProfile) {
        this._storeProfileLocally(result.user, finalProfile);
      }
      return { success: true, user: result.user, profile: finalProfile };
    }
    return { success: false, error: result?.error || 'Login failed' };
  },

  _storeProfileLocally(user, profile) {
    const profiles = JSON.parse(localStorage.getItem('uxplore_profiles') || '{}');
    profiles[`profile_${user.id}`] = profile;
    localStorage.setItem('uxplore_profiles', JSON.stringify(profiles));
  },

  getProfile() {
    const user = this.getUser();
    if (!user) return null;
    const profiles = JSON.parse(localStorage.getItem('uxplore_profiles') || '{}');
    return profiles[`profile_${user.id}`] || null;
  },

  setProfile(profileData) {
    const user = this.getUser();
    if (!user) return;
    const profiles = JSON.parse(localStorage.getItem('uxplore_profiles') || '{}');
    profiles[`profile_${user.id}`] = profileData;
    localStorage.setItem('uxplore_profiles', JSON.stringify(profiles));

    const token = this.getToken();
    if (token) {
      apiCall('POST', '/profile', {
        gameUsername: profileData.gameUsername,
        avatar: profileData.avatar,
        levelProgress: profileData.levelProgress
      }, token).catch(() => {});
    }
  },

  getLevelProgress() {
    const profile = this.getProfile();
    const defaultProgress = {
      level1: { completed: false, score: 0 },
      level2: { completed: false, score: 0 },
      level3: { completed: false, score: 0 },
      level4: { completed: false, score: 0 },
      level5: { completed: false, score: 0 }
    };
    return profile?.levelProgress || defaultProgress;
  },

  setLevelProgress(progress) {
    let profile = this.getProfile();
    const user = this.getUser();
    const defaultUsername = user ? `Player ${user.id}` : `Player ${Date.now()}`;
    if (!profile) {
      profile = {
        gameUsername: defaultUsername,
        avatar: '👾',
        createdAt: new Date().toISOString(),
        levelProgress: progress
      };
    } else {
      profile.levelProgress = progress;
    }
    this.setProfile(profile);
  },

  completeLevelQuiz(levelId, score) {
    let progress = this.getLevelProgress();
    if (progress[levelId]) {
      progress[levelId].completed = true;
      progress[levelId].score = score;
    }
    this.setLevelProgress(progress);

    const token = this.getToken();
    if (token) {
      apiCall('POST', `/progress/${levelId}`, { score }, token).then(result => {
        if (result && result.success && result.profile) {
          const user = this.getUser();
          if (user) this._storeProfileLocally(user, result.profile);
        } else {
          console.warn('Progress save to server may have failed:', result);
        }
      }).catch(err => console.warn('Progress save error:', err));
    }
  },

  isLevelUnlocked(levelId) {
    if (levelId === 'level1') return true;
    const progress = this.getLevelProgress();
    const levelNum = parseInt(levelId.replace('level', ''));
    const prevLevel = `level${levelNum - 1}`;
    return progress[prevLevel] && progress[prevLevel].completed;
  },

  updateAvatar(newAvatarPath) {
    const profile = this.getProfile();
    if (profile) {
      profile.avatar = newAvatarPath;
      this.setProfile(profile);
      const token = this.getToken();
      if (token) apiCall('PATCH', '/profile', { avatar: newAvatarPath }, token).catch(() => {});
      return true;
    }
    return false;
  },

  updateGameUsername(newUsername) {
    const profile = this.getProfile();
    if (profile) {
      profile.gameUsername = newUsername;
      this.setProfile(profile);
      const token = this.getToken();
      if (token) apiCall('PATCH', '/profile', { gameUsername: newUsername }, token).catch(() => {});
      return true;
    }
    return false;
  },

  updateAccountUsername(newUsername) {
    const user = this.getUser();
    if (!user) return false;
    const users = JSON.parse(localStorage.getItem('uxplore_users') || '[]');
    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== user.id)) {
      return false;
    }
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].username = newUsername;
      localStorage.setItem('uxplore_users', JSON.stringify(users));
      user.username = newUsername;
      this.setUser(user);
      const token = this.getToken();
      if (token) apiCall('PATCH', '/auth/username', { username: newUsername }, token).catch(() => {});
      return true;
    }
    return false;
  },

  async syncFromServer() {
    const token = this.getToken();
    const user = this.getUser();
    if (!token || !user) return;
    const localProfile = this.getProfile();
    const result = await apiCall('GET', '/profile', null, token);
    if (result && result.profile) {
      const serverLP = result.profile.levelProgress || {};
      const localLP = (localProfile && localProfile.levelProgress) || {};
      const mergedLP = { ...serverLP };
      let hasLocalBetter = false;
      Object.keys(localLP).forEach(lvl => {
        const local = localLP[lvl];
        const server = serverLP[lvl] || { completed: false, score: 0 };
        if (local.completed && (!server.completed || local.score > server.score)) {
          mergedLP[lvl] = local;
          hasLocalBetter = true;
        }
      });
      const merged = { ...result.profile, levelProgress: mergedLP };
      this._storeProfileLocally(user, merged);
      if (hasLocalBetter) {
        apiCall('POST', '/profile', {
          gameUsername: merged.gameUsername,
          avatar: merged.avatar,
          levelProgress: mergedLP
        }, token).catch(() => {});
      }
    }
  }
};

function navigateTo(page) {
  const user = StorageManager.getUser();
  const profile = StorageManager.getProfile();

  if (page !== 'logo' && page !== 'login' && page !== 'halloffame') {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    if (page !== 'login' && page !== 'profile' && !profile) {
      window.location.href = 'profile.html';
      return;
    }
  }

  const pages = {
    'logo': 'index.html',
    'login': 'login.html',
    'profile': 'profile.html',
    'introduction': 'introduction.html',
    'mechanics': 'mechanics.html',
    'levels': 'levels.html',
    'halloffame': 'halloffame.html',
    'level1': 'levels/level1.html',
    'level2': 'levels/level2.html',
    'level3': 'levels/level3.html',
    'level4': 'levels/level4.html',
    'level5': 'levels/level5.html'
  };

  if (pages[page]) {
    window.location.href = pages[page];
  }
}

function logout() {
  StorageManager.removeUser();
  StorageManager.removeToken();
  StorageManager.setProfile(null);
  window.location.href = 'index.html';
}

function checkAuth() {
  const user = StorageManager.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  StorageManager.syncFromServer();
  displayUserInfo();
  return user;
}

function getAllUsersWithScores() {
  const allUsersData = [];
  const profiles = JSON.parse(localStorage.getItem('uxplore_profiles') || '{}');
  Object.keys(profiles).forEach(profileKey => {
    const profile = profiles[profileKey];
    if (!profile?.gameUsername) return;
    const levelProgress = profile.levelProgress || {
      level1: { completed: false, score: 0 },
      level2: { completed: false, score: 0 },
      level3: { completed: false, score: 0 },
      level4: { completed: false, score: 0 },
      level5: { completed: false, score: 0 }
    };
    const totalScore = Object.values(levelProgress).reduce(
      (sum, level) => sum + (level.completed ? level.score : 0), 0
    );
    const completedLevels = Object.values(levelProgress).filter(l => l.completed).length;
    allUsersData.push({
      gameUsername: profile.gameUsername,
      avatar: profile.avatar,
      totalScore,
      completedLevels,
      levelScores: levelProgress
    });
  });
  return allUsersData.sort((a, b) => b.totalScore - a.totalScore);
}

function getRankings() {
  return getAllUsersWithScores().map((user, index) => ({ ...user, rank: index + 1 }));
}

function getAvatarPath(avatarFilename) {
  if (!avatarFilename || avatarFilename.includes('/') || /\p{Emoji}/u.test(avatarFilename)) {
    return avatarFilename;
  }
  const isLevelPage = window.location.pathname.includes('/levels/');
  return isLevelPage ? '../' + avatarFilename : avatarFilename;
}

function displayUserInfo() {
  const user = StorageManager.getUser();
  const profile = StorageManager.getProfile();
  if (!user) return;
  const userElement = document.getElementById('user-info');
  if (!userElement) return;
  const displayName = profile?.gameUsername || user.username;
  const avatarFilename = profile?.avatar || '👾';
  const avatarPath = getAvatarPath(avatarFilename);
  const isImageFile = avatarPath && /\.(png|jpg|gif)$/i.test(avatarPath);
  const avatarHTML = isImageFile
    ? `<img src="${avatarPath}" alt="Avatar" style="width:40px;height:40px;border-radius:4px;border:1px solid var(--accent-cyan);">`
    : `<span>${avatarPath}</span>`;
  userElement.innerHTML = `
    <span style="display:flex;align-items:center;gap:10px;">
      <span style="cursor:pointer;display:flex;align-items:center;" onclick="openEditProfileModal()">
        ${avatarHTML}
        <span style="margin:0 15px 0 5px;">${displayName}</span>
      </span>
      <button class="btn" onclick="navigateTo('halloffame')" style="padding:8px 15px;font-size:12px;margin-right:5px;">🏆</button>
      <button class="btn" onclick="logout()" style="padding:8px 15px;font-size:12px;">Logout</button>
    </span>
  `;
}

function openEditProfileModal() {
  const profile = StorageManager.getProfile();
  if (!profile) return;
  const modal = document.getElementById('edit-profile-modal') || createEditModal();
  document.getElementById('edit-username').value = profile.gameUsername || '';
  document.getElementById('edit-account-username').value = StorageManager.getUser().username || '';
  document.querySelectorAll('.edit-avatar-option').forEach(option => {
    option.classList.remove('selected');
    if (option.getAttribute('data-avatar') === profile.avatar) option.classList.add('selected');
  });
  modal.classList.add('active');
}

function createEditModal() {
  let modal = document.getElementById('edit-profile-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'edit-profile-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit Profile</h2>
        <button class="modal-close" onclick="closeEditProfileModal()">×</button>
      </div>
      <form onsubmit="saveProfileChanges(event)">
        <div class="form-group">
          <label for="edit-username">Game Username</label>
          <input type="text" id="edit-username" placeholder="Enter your gaming name" required>
        </div>
        <div class="form-group">
          <label for="edit-account-username">Account Username</label>
          <input type="text" id="edit-account-username" placeholder="Enter your account name" required>
        </div>
        <div class="form-group">
          <label>Select Avatar</label>
          <div class="avatar-grid">
            <div class="edit-avatar-option" data-avatar="avatar-m.png" onclick="selectEditAvatar(this)" style="cursor:pointer;">
              <img src="${getAvatarPath('avatar-m.png')}" alt="Avatar 1" style="width:60px;height:60px;border-radius:4px;">
            </div>
            <div class="edit-avatar-option" data-avatar="avatar-m2.png" onclick="selectEditAvatar(this)" style="cursor:pointer;">
              <img src="${getAvatarPath('avatar-m2.png')}" alt="Avatar 2" style="width:60px;height:60px;border-radius:4px;">
            </div>
            <div class="edit-avatar-option" data-avatar="avatar-f.png" onclick="selectEditAvatar(this)" style="cursor:pointer;">
              <img src="${getAvatarPath('avatar-f.png')}" alt="Avatar 3" style="width:60px;height:60px;border-radius:4px;">
            </div>
            <div class="edit-avatar-option" data-avatar="avatar-f2.png" onclick="selectEditAvatar(this)" style="cursor:pointer;">
              <img src="${getAvatarPath('avatar-f2.png')}" alt="Avatar 4" style="width:60px;height:60px;border-radius:4px;">
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeEditProfileModal()" style="width:100%;margin:0;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="width:100%;margin:0;">Save Changes</button>
        </div>
        <p id="edit-message" style="text-align:center;margin-top:15px;color:var(--success);"></p>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) closeEditProfileModal(); });
  return modal;
}

function selectEditAvatar(element) {
  document.querySelectorAll('.edit-avatar-option').forEach(opt => opt.classList.remove('selected'));
  element.classList.add('selected');
}

function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) modal.classList.remove('active');
}

function saveProfileChanges(event) {
  event.preventDefault();
  const newGameUsername = document.getElementById('edit-username').value.trim();
  const newAccountUsername = document.getElementById('edit-account-username').value.trim();
  const selectedAvatar = document.querySelector('.edit-avatar-option.selected');
  if (!newGameUsername || !newAccountUsername || !selectedAvatar) {
    showEditMessage('⚠ All fields are required', 'error');
    return;
  }
  if (!StorageManager.updateGameUsername(newGameUsername)) {
    showEditMessage('✗ Failed to update game username', 'error');
    return;
  }
  if (!StorageManager.updateAccountUsername(newAccountUsername)) {
    showEditMessage('✗ Username already exists', 'error');
    return;
  }
  const newAvatar = selectedAvatar.getAttribute('data-avatar');
  if (!StorageManager.updateAvatar(newAvatar)) {
    showEditMessage('✗ Failed to update avatar', 'error');
    return;
  }
  showEditMessage('✓ Profile updated successfully!', 'success');
  setTimeout(() => { closeEditProfileModal(); displayUserInfo(); location.reload(); }, 1500);
}

function showEditMessage(message, type) {
  const messageDiv = document.getElementById('edit-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.style.color = type === 'error' ? 'var(--error)' : 'var(--success)';
  }
}

function calculateScore(correctAnswers, totalQuestions) {
  return Math.round((correctAnswers / totalQuestions) * 100);
}

function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  const container = document.querySelector('.container') || document.querySelector('.content-area');
  if (container) {
    container.insertBefore(messageDiv, container.firstChild);
    setTimeout(() => messageDiv.remove(), 3000);
  }
}

const SoundManager = {
  audioContext: null,
  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  },
  playTone(frequency, duration, startTime = 0, volume = 0.3) {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime + startTime);
      oscillator.stop(ctx.currentTime + startTime + duration);
    } catch (e) {
      console.log('Audio API not available');
    }
  },
  playCorrect() {
    this.playTone(523.25, 0.1, 0, 0.3);
    this.playTone(659.25, 0.1, 0.1, 0.3);
    this.playTone(783.99, 0.15, 0.2, 0.3);
  },
  playWrong() {
    this.playTone(523.25, 0.1, 0, 0.2);
    this.playTone(392.00, 0.1, 0.1, 0.2);
    this.playTone(261.63, 0.15, 0.2, 0.2);
  },
  playPassed() {
    this.playTone(523.25, 0.15, 0, 0.3);
    this.playTone(659.25, 0.15, 0.15, 0.3);
    this.playTone(783.99, 0.15, 0.3, 0.3);
    this.playTone(1046.5, 0.25, 0.45, 0.3);
  },
  playFailed() {
    this.playTone(349.23, 0.2, 0, 0.2);
    this.playTone(293.66, 0.2, 0.2, 0.2);
    this.playTone(246.94, 0.3, 0.4, 0.2);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  displayUserInfo();
  createEditModal();
});
