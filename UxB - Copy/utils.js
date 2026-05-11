/**
 * ==========================================
 * UxPlore Buster - Core Utilities (utils.js)
 * ==========================================
 * Handles: Storage, Auth, Navigation, Audio, UI Helpers
 */

// ==========================================
// 🗄️ STORAGE MANAGER
// ==========================================
const StorageManager = {
  // ── User Management ──
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
  
  registerUser(username, password) {
    const users = JSON.parse(localStorage.getItem('uxplore_users') || '[]');
    const newUser = {
      id: Date.now(),
      username: username,
      password: password,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('uxplore_users', JSON.stringify(users));
    return newUser;
  },
  
  loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem('uxplore_users') || '[]');
    return users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && u.password === password
    ) || null;
  },
  
  // ── Profile Management ──
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
  },
  
  // ── Level Progress ──
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
  },
  
  isLevelUnlocked(levelId) {
    if (levelId === 'level1') return true;
    const progress = this.getLevelProgress();
    const levelNum = parseInt(levelId.replace('level', ''));
    const prevLevel = `level${levelNum - 1}`;
    return progress[prevLevel]?.completed || false;
  },
  
  // ── Profile Updates ──
  updateAvatar(newAvatarPath) {
    const profile = this.getProfile();
    if (profile) {
      profile.avatar = newAvatarPath;
      this.setProfile(profile);
      return true;
    }
    return false;
  },
  
  updateGameUsername(newUsername) {
    const profile = this.getProfile();
    if (profile) {
      profile.gameUsername = newUsername;
      this.setProfile(profile);
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
      return true;
    }
    return false;
  }
};

// ==========================================
// 🔊 SOUND MANAGER (Web Audio API)
// ==========================================
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
      console.log('🔇 Audio API not available');
    }
  },
  
  playCorrect() {
    this.playTone(523.25, 0.1, 0, 0.3);   // C5
    this.playTone(659.25, 0.1, 0.1, 0.3); // E5
    this.playTone(783.99, 0.15, 0.2, 0.3);// G5
  },
  
  playWrong() {
    this.playTone(523.25, 0.1, 0, 0.2);   // C5
    this.playTone(392.00, 0.1, 0.1, 0.2); // G4
    this.playTone(261.63, 0.15, 0.2, 0.2);// C4
  },
  
  playPassed() {
    this.playTone(523.25, 0.15, 0, 0.3);
    this.playTone(659.25, 0.15, 0.15, 0.3);
    this.playTone(783.99, 0.15, 0.3, 0.3);
    this.playTone(1046.5, 0.25, 0.45, 0.3); // C6
  },
  
  playFailed() {
    this.playTone(349.23, 0.2, 0, 0.2);  // F4
    this.playTone(293.66, 0.2, 0.2, 0.2);// D4
    this.playTone(246.94, 0.3, 0.4, 0.2);// B3
  }
};

// ==========================================
// 🧭 NAVIGATION & AUTH
// ==========================================
function navigateTo(page) {
  const user = StorageManager.getUser();
  const profile = StorageManager.getProfile();
  
  // Auth check for protected pages
  if (page && !['logo', 'login', 'halloffame'].includes(page)) {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    if (!profile && !['login', 'profile'].includes(page)) {
      window.location.href = 'index.html';
      return;
    }
  }
  
  const pages = {
    'logo': 'index.html',
    'login': 'index.html', 
    'profile': 'index.html',
    'introduction': 'index.html',
    'mechanics': 'index.html',
    'levels': 'index.html',
    'halloffame': 'index.html',
    'level1': 'level.html?level=level1',
    'level2': 'level.html?level=level2',
    'level3': 'level.html?level=level3',
    'level4': 'level.html?level=level4',
    'level5': 'level.html?level=level5'
  };
  
  if (pages[page]) {
    window.location.href = pages[page];
  }
}

function logout() {
  StorageManager.removeUser();
  StorageManager.setProfile(null);
  window.location.href = 'index.html';
}

function checkAuth() {
  const user = StorageManager.getUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  displayUserInfo();
  return user;
}

// ==========================================
// 👤 USER INFO DISPLAY
// ==========================================
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

function getAvatarPath(avatarFilename) {
  if (!avatarFilename || avatarFilename.includes('/') || /\p{Emoji}/u.test(avatarFilename)) {
    return avatarFilename;
  }
  return avatarFilename;
}

// ==========================================
// 🏆 HALL OF FAME / RANKINGS
// ==========================================
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
  return getAllUsersWithScores().map((user, index) => ({
    ...user,
    rank: index + 1
  }));
}

// ==========================================
// ✏️ PROFILE EDIT MODAL
// ==========================================
function openEditProfileModal() {
  const profile = StorageManager.getProfile();
  if (!profile) return;
  
  const modal = document.getElementById('edit-profile-modal') || createEditModal();
  
  document.getElementById('edit-username').value = profile.gameUsername || '';
  document.getElementById('edit-account-username').value = StorageManager.getUser().username || '';
  
  document.querySelectorAll('.edit-avatar-option').forEach(option => {
    option.classList.remove('selected');
    if (option.getAttribute('data-avatar') === profile.avatar) {
      option.classList.add('selected');
    }
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
            <div class="edit-avatar-option" data-avatar="avatar-m.png" onclick="selectEditAvatar(this)">
              <img src="${getAvatarPath('avatar-m.png')}" alt="Avatar 1" style="width:60px;height:60px;border-radius:4px;">
            </div>
            <div class="edit-avatar-option" data-avatar="avatar-m2.png" onclick="selectEditAvatar(this)">
              <img src="${getAvatarPath('avatar-m2.png')}" alt="Avatar 2" style="width:60px;height:60px;border-radius:4px;">
            </div>
            <div class="edit-avatar-option" data-avatar="avatar-f.png" onclick="selectEditAvatar(this)">
              <img src="${getAvatarPath('avatar-f.png')}" alt="Avatar 3" style="width:60px;height:60px;border-radius:4px;">
            </div>
            <div class="edit-avatar-option" data-avatar="avatar-f2.png" onclick="selectEditAvatar(this)">
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
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeEditProfileModal();
  });
  
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
  setTimeout(() => {
    closeEditProfileModal();
    displayUserInfo();
    location.reload();
  }, 1500);
}

function showEditMessage(message, type) {
  const messageDiv = document.getElementById('edit-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.style.color = type === 'error' ? 'var(--error)' : 'var(--success)';
  }
}

// ==========================================
// 🛠️ UI HELPERS
// ==========================================
function calculateScore(correct, total) {
  return Math.round((correct / total) * 100);
}

function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    padding:12px 20px;margin:10px 0;border-radius:6px;
    background:${type==='error'?'rgba(231,76,60,0.2)':'rgba(61,139,253,0.2)'};
    border-left:3px solid ${type==='error'?'var(--error)':'var(--accent-cyan)'};
    color:${type==='error'?'var(--error)':'var(--accent-cyan)'};
  `;
  
  const container = document.querySelector('.container') || document.querySelector('.content-area');
  if (container) {
    container.insertBefore(messageDiv, container.firstChild);
    setTimeout(() => messageDiv.remove(), 3000);
  }
}

// ==========================================
// 🚀 INITIALIZATION
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  displayUserInfo();
  createEditModal();
});

// ==========================================
// 🎮 LEVEL-SPECIFIC LOGIC (Scoped by URL)
// ==========================================

// ── LEVEL 3: Design Challenges ──
if (window.location.href.includes('level.html') && window.location.search.includes('level=level3')) {
  checkAuth();
  
  let L3_currentChallenge = 1;
  let L3_drags = {};
  let L3_dragInitialized = false;
  
  function L3_setupDragDrop() {
    if (L3_dragInitialized) return;
    L3_dragInitialized = true;
    
    const quizSection = document.getElementById('L3-quiz-section');
    if (!quizSection) return;
    
    quizSection.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('draggable-item')) {
        e.target.style.opacity = '0.5';
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: e.target.dataset.type || e.target.dataset.font || e.target.dataset.color || e.target.dataset.hierarchy,
          text: e.target.textContent,
          html: e.target.outerHTML
        }));
      }
    });
    
    quizSection.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('draggable-item')) {
        e.target.style.opacity = '1';
      }
    });
    
    quizSection.addEventListener('dragover', (e) => {
      const target = e.target.closest('.drop-target, .drop-target-order');
      if (target) {
        e.preventDefault();
        target.style.background = 'rgba(61,139,253,0.3)';
        target.style.borderColor = '#00d9ff';
      }
    });
    
    quizSection.addEventListener('dragleave', (e) => {
      const target = e.target.closest('.drop-target, .drop-target-order');
      if (target && !target.contains(e.relatedTarget)) {
        target.style.background = 'rgba(61,139,253,0.1)';
        target.style.borderColor = '';
      }
    });
    
    quizSection.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.drop-target, .drop-target-order');
      if (target) {
        target.style.background = 'rgba(61,139,253,0.1)';
        target.style.borderColor = '';
        
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          const clone = document.createElement('div');
          clone.className = 'draggable-item dropped';
          clone.innerHTML = data.html;
          clone.draggable = false;
          clone.style.cursor = 'default';
          clone.style.marginBottom = '8px';
          
          if (target.classList.contains('drop-target-order')) {
            const label = target.querySelector('p')?.textContent || '';
            target.innerHTML = `<p style="font-weight:bold;color:var(--accent-cyan);">${label}</p>`;
          } else {
            target.innerHTML = '';
          }
          target.appendChild(clone);
        } catch(err) {
          console.warn('Drop failed:', err);
        }
      }
    });
  }
  
  window.L3_showQuiz = function() {
    document.getElementById('L3-lecture-section').style.display = 'none';
    document.getElementById('L3-quiz-section').style.display = 'block';
    L3_setupDragDrop();
    L3_updateProgressText();
  };
  
  window.L3_updateProgressText = function() {
    const challenges = ['Button Shape Sorter', 'Font Matcher', 'Color Psychology Sorter', 'Visual Hierarchy Builder'];
    document.getElementById('L3-progress-text').textContent = `Challenge ${L3_currentChallenge} of 4: ${challenges[L3_currentChallenge - 1]}`;
    document.getElementById('L3-progress-fill').style.width = ((L3_currentChallenge - 1) * 25) + '%';
  };
  
  window.L3_checkChallenge1 = function() {
    const targets = document.querySelectorAll('#L3-challenge1 .drop-target');
    let correct = 0;
    const answers = { 'login': 'Square Button', 'cta': 'Rounded Button', 'decorator': '❤ Heart' };
    
    targets.forEach(t => {
      if (t.textContent.includes(answers[t.getAttribute('data-target')])) {
        correct++;
        t.style.borderColor = '#2ecc71';
      } else {
        t.style.borderColor = '#e74c3c';
      }
    });
    
    if (correct === 3) {
      SoundManager.playCorrect();
      setTimeout(() => { alert('✓ Correct!'); L3_nextChallenge(); }, 500);
    } else {
      SoundManager.playWrong();
      alert('❌ Not quite right. Try again!');
    }
  };
  
  window.L3_checkChallenge2 = function() {
    const targets = document.querySelectorAll('#L3-challenge2 .drop-target');
    let correct = 0;
    const answers = { 'web': 'SANS-SERIF', 'poster': 'SANS-SERIF', 'special': 'CURSIVE' };
    
    targets.forEach(t => {
      if (t.textContent.includes(answers[t.getAttribute('data-font-target')])) correct++;
    });
    
    if (correct === 3) {
      SoundManager.playCorrect();
      setTimeout(() => { alert('✓ Correct!'); L3_nextChallenge(); }, 500);
    } else {
      SoundManager.playWrong();
      alert('❌ Not quite right. Try again!');
    }
  };
  
  window.L3_checkChallenge3 = function() {
    const targets = document.querySelectorAll('#L3-challenge3 .drop-target');
    let correct = 0;
    const answers = { 'danger': 'RED', 'success': 'GREEN', 'trust': 'BLUE/CYAN', 'warning': 'YELLOW' };
    
    targets.forEach(t => {
      if (t.textContent.includes(answers[t.getAttribute('data-color-target')])) correct++;
    });
    
    if (correct === 4) {
      SoundManager.playCorrect();
      setTimeout(() => { alert('✓ Correct!'); L3_nextChallenge(); }, 500);
    } else {
      SoundManager.playWrong();
      alert('❌ Not quite right. Try again!');
    }
  };
  
  window.L3_checkChallenge4 = function() {
    const orders = document.querySelectorAll('#L3-challenge4 .drop-target-order');
    let correct = 0;
    const correctOrder = ['MAIN HEADLINE', '📢 Call to Action', '🏢 Small Logo', 'Footer Text'];
    
    orders.forEach((o, i) => {
      if (o.textContent.includes(correctOrder[i])) correct++;
    });
    
    if (correct === 4) {
      SoundManager.playCorrect();
      setTimeout(() => { alert('✓ Correct!'); L3_completeChallenge(); }, 500);
    } else {
      SoundManager.playWrong();
      alert('❌ Not quite right. Try again!');
    }
  };
  
  window.L3_resetChallenge1 = function() {
    document.querySelectorAll('#L3-challenge1 .drop-target').forEach(t => {
      const target = t.getAttribute('data-target');
      if (target === 'login') {
        t.innerHTML = '<p style="font-weight:bold;color:var(--accent-cyan);margin-bottom:5px;">🔐 Login Form</p><p style="font-size:12px;">Drop appropriate button here</p>';
      } else if (target === 'cta') {
        t.innerHTML = '<p style="font-weight:bold;color:var(--accent-cyan);margin-bottom:5px;">🎯 Call-to-Action</p><p style="font-size:12px;">Drop appropriate button here</p>';
      } else {
        t.innerHTML = '<p style="font-weight:bold;color:var(--accent-cyan);margin-bottom:5px;">✨ Decorator/Like</p><p style="font-size:12px;">Drop appropriate button here</p>';
      }
      t.style.borderColor = '';
    });
  };
  
  window.L3_resetChallenge2 = function() {
    document.querySelectorAll('#L3-challenge2 .drop-target').forEach(t => {
      const target = t.getAttribute('data-font-target');
      if (target === 'web') {
        t.innerHTML = '<p style="font-weight:bold;color:var(--accent-cyan);margin-bottom:5px;">🌐 Web & UI Design</p><p style="font-size:12px;color:var(--text-secondary);">Readable on screens</p>';
      } else if (target === 'poster') {
        t.innerHTML = '<p style="font-weight:bold;color:var(--accent-cyan);margin-bottom:5px;">📢 Posters & Bold Display</p><p style="font-size:12px;color:var(--text-secondary);">Must be visible from distance</p>';
      } else {
        t.innerHTML = '<p style="font-weight:bold;color:var(--accent-cyan);margin-bottom:5px;">✨ Logos & Special Moments</p><p style="font-size:12px;color:var(--text-secondary);">Artistic & decorative</p>';
      }
      t.style.borderColor = '';
    });
  };
  
  window.L3_resetChallenge3 = function() {
    document.querySelectorAll('#L3-challenge3 .drop-target').forEach(t => {
      const target = t.getAttribute('data-color-target');
      if (target === 'danger') {
        t.innerHTML = '<p style="font-weight:bold;color:var(--error);margin-bottom:5px;">⚠️ Delete/Dangerous Action</p><p style="font-size:12px;color:var(--text-secondary);">Alert users to critical actions</p>';
      } else if (target === 'success') {
        t.innerHTML = '<p style="font-weight:bold;color:var(--success);margin-bottom:5px;">✓ Success Message</p><p style="font-size:12px;color:var(--text-secondary);">Confirm positive actions</p>';
      } else if (target === 'trust') {
        t.innerHTML = '<p style="font-weight:bold;color:var(--accent-cyan);margin-bottom:5px;">🔒 Trust/Professional</p><p style="font-size:12px;color:var(--text-secondary);">Build confidence</p>';
      } else {
        t.innerHTML = '<p style="font-weight:bold;color:var(--warning);margin-bottom:5px;">⏱️ Warning/Attention</p><p style="font-size:12px;color:var(--text-secondary);">Draw attention gently</p>';
      }
      t.style.borderColor = '';
    });
  };
  
  window.L3_resetChallenge4 = function() {
    document.querySelectorAll('#L3-challenge4 .drop-target-order').forEach(t => {
      t.innerHTML = '';
    });
  };
  
  window.L3_nextChallenge = function() {
    L3_currentChallenge++;
    document.getElementById(`L3-challenge${L3_currentChallenge - 1}`).style.display = 'none';
    
    if (L3_currentChallenge <= 4) {
      document.getElementById(`L3-challenge${L3_currentChallenge}`).style.display = 'block';
      L3_updateProgressText();
    }
  };
  
  window.L3_completeChallenge = function() {
    L3_showResults(100);
  };
  
  window.L3_showResults = function(percentage) {
    document.getElementById('L3-quiz-section').style.display = 'none';
    document.getElementById('L3-results-section').style.display = 'block';
    
    const passed = percentage >= 70;
    if (passed) SoundManager.playPassed(); else SoundManager.playFailed();
    
    document.getElementById('L3-result-title').textContent = passed ? '🎉 Level Complete!' : '⚠️ Keep Practicing!';
    document.getElementById('L3-result-title').style.color = passed ? 'var(--success)' : 'var(--error)';
    document.getElementById('L3-result-message').textContent = passed ? 'You\'ve mastered design principles!' : 'Review the challenges and try again.';
    document.getElementById('L3-final-score').textContent = percentage + '%';
    document.getElementById('L3-final-score').style.color = passed ? 'var(--success)' : 'var(--error)';
    document.getElementById('L3-result-feedback').textContent = passed 
      ? 'Excellent! You understand button design, typography, color psychology, and visual hierarchy.' 
      : 'Not quite there yet! Review the lecture material and try again.';
    
    StorageManager.completeLevelQuiz('level3', percentage);
  };
}

// ── LEVEL 4: Coding Challenges ──
if (window.location.href.includes('level.html') && window.location.search.includes('level=level4')) {
  checkAuth();
  
  let L4_completedChallenges = {};
  const L4_challenges = [
    { 
      id: 1, 
      title: "🔘 Challenge 1: Your First Button", 
      description: "Create a simple button with any style you like!", 
      startCode: "<button>Click Me</button>", 
      validate: html => html.toLowerCase().includes('<button'), 
      points: 25 
    },
    { 
      id: 2, 
      title: "🎨 Challenge 2: Simple Card", 
      description: "Create a card with a title and description inside a div", 
      startCode: '<div class="card">\n<h3>My Card</h3>\n<p>This is a card</p>\n</div>', 
      validate: html => { 
        const h = html.toLowerCase(); 
        return h.includes('<div') && (h.includes('<h1')||h.includes('<h2')||h.includes('<h3')) && h.includes('<p'); 
      }, 
      points: 25 
    },
    { 
      id: 3, 
      title: "📝 Challenge 3: Login Form", 
      description: "Create a form with input fields for username/email and password", 
      startCode: '<form>\n<input type="text" placeholder="Username">\n<input type="password" placeholder="Password">\n<button>Login</button>\n</form>', 
      validate: html => { 
        const h = html.toLowerCase(); 
        return (h.includes('<form') || h.includes('<input')) && (h.match(/<input/g) || []).length >= 2; 
      }, 
      points: 25 
    },
    { 
      id: 4, 
      title: "📦 Challenge 4: Two Boxes Side by Side", 
      description: "Create two boxes next to each other (use flexbox or grid)", 
      startCode: '<div class="container">\n<div class="box">Box 1</div>\n<div class="box">Box 2</div>\n</div>\n<style>\n.container { display: flex; }\n</style>', 
      validate: html => { 
        const h = html.toLowerCase(); 
        return h.includes('container') && (h.match(/<div/g) || []).length >= 2 && h.includes('display'); 
      }, 
      points: 25 
    }
  ];
  
  window.L4_startChallenges = function() {
    document.getElementById('L4-lecture-section').style.display = 'none';
    document.getElementById('L4-challenge-section').style.display = 'block';
    L4_renderChallenges();
  };
  
  window.L4_renderChallenges = function() {
    const container = document.getElementById('L4-challenges-container');
    if (!container) return;
    container.innerHTML = '';
    
    let currentChallenge = null;
    for (let i = 0; i < L4_challenges.length; i++) {
      if (!L4_completedChallenges[L4_challenges[i].id]) {
        currentChallenge = L4_challenges[i];
        break;
      }
    }
    
    if (!currentChallenge) {
      container.innerHTML = '<p style="text-align:center;color:var(--success);padding:40px;font-size:20px;">🎉 ALL CHALLENGES COMPLETED!</p>';
      return;
    }
    
    const div = document.createElement('div');
    div.className = 'challenge-card';
    div.id = 'L4-challenge-' + currentChallenge.id;
    div.innerHTML = `
      <h3>${currentChallenge.title}</h3>
      <p style="color:var(--text-secondary);margin-bottom:15px;">${currentChallenge.description}</p>
      <p style="color:var(--accent-cyan);font-weight:bold;margin-bottom:20px;">Challenge ${currentChallenge.id} of 4</p>
      <div class="code-editor-container">
        <div class="code-panel">
          <div class="panel-header">Code Editor</div>
          <textarea class="code-input" id="L4-code-${currentChallenge.id}" placeholder="Write code..."></textarea>
        </div>
        <div class="preview-panel">
          <div class="panel-header">Live Preview</div>
          <iframe id="L4-preview-${currentChallenge.id}" class="preview-frame"></iframe>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:15px;">
        <button class="btn btn-secondary" onclick="L4_updatePreview(${currentChallenge.id})" style="flex:1;">UPDATE</button>
        <button class="btn btn-primary" onclick="L4_validateChallenge(${currentChallenge.id})" style="flex:1;">CHECK</button>
      </div>
      <div id="L4-status-${currentChallenge.id}"></div>
    `;
    container.appendChild(div);
    
    const textarea = document.getElementById('L4-code-' + currentChallenge.id);
    textarea.value = currentChallenge.startCode;
    textarea.addEventListener('input', () => L4_updatePreview(currentChallenge.id));
    L4_updatePreview(currentChallenge.id);
  };
  
  window.L4_updatePreview = function(challengeId) {
    const code = document.getElementById('L4-code-' + challengeId).value;
    const iframe = document.getElementById('L4-preview-' + challengeId);
    
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><style>
        body{background:white;color:#000;font-family:Arial,sans-serif;padding:20px;margin:0;}
      </style></head><body>${code}</body></html>`);
      doc.close();
    } catch (e) {
      console.error('Preview error:', e);
    }
  };
  
  window.L4_validateChallenge = function(challengeId) {
    const challenge = L4_challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const codeElement = document.getElementById('L4-code-' + challengeId);
    if (!codeElement) return;
    
    const code = codeElement.value;
    const statusDiv = document.getElementById('L4-status-' + challengeId);
    
    if (code.trim() === '') {
      statusDiv.innerHTML = '<div class="challenge-status status-incomplete">❌ Write some code first!</div>';
      return;
    }
    
    if (challenge.validate(code)) {
      L4_completedChallenges[challengeId] = true;
      statusDiv.innerHTML = `<div class="challenge-status status-complete">✅ PERFECT! +${challenge.points} points</div>`;
      codeElement.disabled = true;
      SoundManager.playCorrect();
      alert(`🎉 Great job! Challenge ${challengeId} completed!\nChallenge ${challengeId + 1} is now unlocked!`);
      setTimeout(() => L4_renderChallenges(), 500);
    } else {
      statusDiv.innerHTML = '<div class="challenge-status status-incomplete">❌ Not quite. Keep trying!</div>';
      SoundManager.playWrong();
      alert('Keep trying! Make sure you have all the required elements.');
    }
  };
  
  window.L4_checkAllChallenges = function() {
    const allComplete = L4_challenges.every(c => L4_completedChallenges[c.id]);
    
    if (allComplete) {
      setTimeout(() => L4_showResults(100), 500);
    } else {
      alert('⚠️ Complete all 4 challenges first!');
    }
  };
  
  window.L4_showResults = function(percentage) {
    document.getElementById('L4-challenge-section').style.display = 'none';
    document.getElementById('L4-results-section').style.display = 'block';
    
    document.getElementById('L4-result-title').textContent = 'Level Complete!';
    document.getElementById('L4-result-message').textContent = 'You mastered HTML and CSS!';
    document.getElementById('L4-final-score').textContent = percentage + '%';
    document.getElementById('L4-result-feedback').textContent = 'Great job! Level 5 is now unlocked!';
    
    SoundManager.playPassed();
    StorageManager.completeLevelQuiz('level4', percentage);
  };
}

// ── LEVEL 5: Debugging Challenges ──
if (window.location.href.includes('level.html') && window.location.search.includes('level=level5')) {
  checkAuth();
  
  let L5_debugCompleted = {};
  const L5_debugChallenges = [
    {
      id: 1,
      title: "🐛 Challenge 1: Unclosed Tag",
      description: "Look at the buggy HTML. The paragraph tag is not properly closed before the div closes.",
      buggyCode: `<div class="card">\n<p>This is a paragraph\n<p>Another paragraph</p>\n</div>`,
      expectedFix: `<div class="card">\n<p>This is a paragraph</p>\n<p>Another paragraph</p>\n</div>`,
      bugs: ["First &lt;p&gt; tag is not closed", "Should be: &lt;p&gt;...&lt;/p&gt;"],
      hints: "Look for tags that don't have proper closing tags",
      points: 25
    },
    {
      id: 2,
      title: "🐛 Challenge 2: Missing Input Type",
      description: "The input field is missing the type attribute. Add type='email' to make it an email input.",
      buggyCode: `<form>\n<input placeholder="Enter your email">\n<button>Submit</button>\n</form>`,
      expectedFix: `<form>\n<input type="email" placeholder="Enter your email">\n<button>Submit</button>\n</form>`,
      bugs: ["Input missing type attribute", "Should be: type=\"email\"", "This improves accessibility and mobile keyboard"],
      hints: "HTML inputs need a type attribute for proper validation",
      points: 25
    },
    {
      id: 3,
      title: "🐛 Challenge 3: Missing alt Attribute",
      description: "Images need alt text for accessibility. Add descriptive alt text to the image tag.",
      buggyCode: `<div class="product">\n<img src="product.jpg">\n<h3>Amazing Product</h3>\n<p>$29.99</p>\n</div>`,
      expectedFix: `<div class="product">\n<img src="product.jpg" alt="Amazing Product">\n<h3>Amazing Product</h3>\n<p>$29.99</p>\n</div>`,
      bugs: ["Image missing alt attribute", "Alt text helps screen readers and SEO", "Should describe what the image shows"],
      hints: "All img tags must have meaningful alt text",
      points: 25
    },
    {
      id: 4,
      title: "🐛 Challenge 4: Fixed Height Overflow",
      description: "The CSS height is too small, cutting off content. Use min-height instead.",
      buggyCode: `<style>\n.box {\nheight: 80px;\npadding: 15px;\nborder: 1px solid cyan;\noverflow: hidden;\n}\n</style>\n<div class="box">\n<h3>Title</h3>\n<p>This is content that might be long</p>\n</div>`,
      expectedFix: `<style>\n.box {\nmin-height: 80px;\npadding: 15px;\nborder: 1px solid cyan;\n}\n</style>\n<div class="box">\n<h3>Title</h3>\n<p>This is content that might be long</p>\n</div>`,
      bugs: ["height: 80px is too restrictive", "overflow: hidden cuts off content", "Use min-height for flexible sizing"],
      hints: "Use min-height instead of fixed height for content containers",
      points: 25
    }
  ];
  
  window.L5_startDebugChallenges = function() {
    document.getElementById('L5-lecture-section').style.display = 'none';
    document.getElementById('L5-debug-challenges-section').style.display = 'block';
    L5_renderDebugChallenges();
  };
  
  window.L5_renderDebugChallenges = function() {
    const container = document.getElementById('L5-debug-challenges-container');
    if (!container) return;
    container.innerHTML = '';
    
    let currentChallenge = null;
    for (let i = 0; i < L5_debugChallenges.length; i++) {
      if (!L5_debugCompleted[L5_debugChallenges[i].id]) {
        currentChallenge = L5_debugChallenges[i];
        break;
      }
    }
    
    if (!currentChallenge) {
      container.innerHTML = '<p style="text-align:center;color:#fff;padding:40px;font-size:20px;font-weight:bold;">🎉 ALL DEBUGGING CHALLENGES COMPLETED!</p>';
      return;
    }
    
    const div = document.createElement('div');
    div.className = 'debug-challenge-card';
    div.id = 'L5-debug-' + currentChallenge.id;
    div.innerHTML = `
      <h3>${currentChallenge.title}</h3>
      <p style="color:#fff;margin-bottom:15px;font-size:15px;">${currentChallenge.description}</p>
      <p style="color:#fff;font-weight:bold;margin-bottom:10px;font-size:14px;">Challenge ${currentChallenge.id} of 4</p>
      <div style="margin-bottom:20px;">
        <div class="code-header" style="background:rgba(231,76,60,0.2);color:#fff;border-bottom:2px solid #e74c3c;">❌ BUGGY CODE (Debug This)</div>
        <textarea id="L5-fix-${currentChallenge.id}" class="debug-textarea" style="width:100%;padding:12px;background:#fff;color:#000;border:2px solid #3d8bfd;font-family:monospace;font-size:13px;min-height:180px;border-radius:4px;box-sizing:border-box;">${currentChallenge.buggyCode}</textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;">
        <div>
          <h4 style="color:#fff;margin-bottom:10px;font-size:14px;font-weight:bold;">🔴 Bugs to Find:</h4>
          <ul class="bug-list" style="color:#fff;margin:0;padding:0;">
            ${currentChallenge.bugs.map(b => `<li style="background:rgba(231,76,60,0.1);border-left:3px solid #e74c3c;padding:8px;margin:6px 0;border-radius:2px;font-size:12px;color:#fff;">• ${b}</li>`).join('')}
          </ul>
        </div>
        <div>
          <div class="hints-box" style="background:rgba(61,139,253,0.1);border-left:3px solid #3d8bfd;padding:12px;border-radius:4px;height:100%;">
            <strong style="color:#fff;font-size:13px;">💡 Hint:</strong>
            <p style="margin:8px 0 0 0;color:#fff;font-size:12px;line-height:1.5;">${currentChallenge.hints}</p>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:15px;">
        <button class="btn btn-primary" onclick="L5_checkFix(${currentChallenge.id})" style="flex:1;padding:12px;">✓ CHECK FIX</button>
        <button class="btn btn-secondary" onclick="L5_showAnswer(${currentChallenge.id})" style="flex:1;padding:12px;">👀 SHOW ANSWER</button>
        <button class="btn btn-secondary" onclick="L5_skip(${currentChallenge.id})" style="flex:1;padding:12px;">⏭ SKIP</button>
      </div>
      <div id="L5-status-${currentChallenge.id}"></div>
    `;
    container.appendChild(div);
  };
  
  window.L5_checkFix = function(challengeId) {
    const challenge = L5_debugChallenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const userCode = document.getElementById('L5-fix-' + challengeId).value;
    const statusDiv = document.getElementById('L5-status-' + challengeId);
    
    const normalizedUser = userCode.replace(/\s+/g, ' ').trim();
    const normalizedExpected = challenge.expectedFix.replace(/\s+/g, ' ').trim();
    
    let isCorrect = normalizedUser === normalizedExpected;
    
    // Fuzzy matching for partial credit
    if (!isCorrect) {
      let keyParts = [];
      if (challengeId === 1) keyParts = ['</p>', '<p>'];
      else if (challengeId === 2) keyParts = ['type="email"', 'input'];
      else if (challengeId === 3) keyParts = ['alt=', 'img'];
      else if (challengeId === 4) keyParts = ['min-height:', '.box'];
      
      isCorrect = keyParts.every(part => normalizedUser.includes(part.replace(/\s+/g, ' ')));
    }
    
    if (isCorrect) {
      statusDiv.innerHTML = '<div style="margin-top:15px;padding:15px;background:rgba(46,204,113,0.2);border-left:3px solid #2ecc71;color:#fff;border-radius:4px;font-weight:bold;">✅ CORRECT! Great debugging! Moving to next challenge...</div>';
      SoundManager.playCorrect();
      setTimeout(() => L5_complete(challengeId), 2000);
    } else {
      statusDiv.innerHTML = '<div style="margin-top:15px;padding:15px;background:rgba(231,76,60,0.2);border-left:3px solid #e74c3c;color:#fff;border-radius:4px;font-weight:bold;">❌ Not quite right. Review the bugs list and hint above.</div>';
      SoundManager.playWrong();
    }
  };
  
  window.L5_showAnswer = function(challengeId) {
    const challenge = L5_debugChallenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    document.getElementById('L5-fix-' + challengeId).value = challenge.expectedFix;
    const statusDiv = document.getElementById('L5-status-' + challengeId);
    statusDiv.innerHTML = `
      <div style="margin-top:15px;padding:20px;background:rgba(46,204,113,0.15);border:2px solid #2ecc71;border-radius:4px;">
        <p style="margin:0 0 12px 0;color:#fff;font-weight:bold;font-size:16px;">✅ CORRECT FIX SHOWN ABOVE</p>
        <p style="margin:0;color:#fff;font-size:14px;">Review the corrected code in the editor and click CHECK FIX to confirm.</p>
      </div>
    `;
  };
  
  window.L5_complete = function(challengeId) {
    L5_debugCompleted[challengeId] = true;
    setTimeout(() => {
      if (challengeId < 4) alert('🎉 Challenge ' + challengeId + ' fixed! Next challenge unlocked.');
      L5_renderDebugChallenges();
    }, 500);
  };
  
  window.L5_skip = function(challengeId) {
    if (confirm('Skip this challenge? You won\'t get the points.')) {
      L5_debugCompleted[challengeId] = true;
      setTimeout(() => L5_renderDebugChallenges(), 300);
    }
  };
  
  window.L5_completeAllDebugChallenges = function() {
    const allComplete = L5_debugChallenges.every(c => L5_debugCompleted[c.id]);
    
    if (allComplete) {
      setTimeout(() => L5_showDebugResults(100), 500);
    } else {
      alert('⚠️ Complete all 4 debugging challenges first!');
    }
  };
  
  window.L5_showDebugResults = function(percentage) {
    document.getElementById('L5-debug-challenges-section').style.display = 'none';
    document.getElementById('L5-results-section').style.display = 'block';
    
    document.getElementById('L5-result-title').textContent = '🎓 Level Complete!';
    document.getElementById('L5-result-message').textContent = 'You mastered debugging!';
    document.getElementById('L5-final-score').textContent = percentage + '%';
    document.getElementById('L5-result-feedback').textContent = 'Congratulations! You\'ve completed UxPlore Buster!';
    
    SoundManager.playPassed();
    StorageManager.completeLevelQuiz('level5', percentage);
  };
}