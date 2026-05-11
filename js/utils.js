// Local Storage Management
const StorageManager = {
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
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    return user || null;
  },

  // Game profile
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

  // Level progress
  getLevelProgress() {
    const profile = this.getProfile();
    if (!profile) {
      return {
        level1: { completed: false, score: 0 },
        level2: { completed: false, score: 0 },
        level3: { completed: false, score: 0 },
        level4: { completed: false, score: 0 },
        level5: { completed: false, score: 0 }
      };
    }
    return profile.levelProgress || {
      level1: { completed: false, score: 0 },
      level2: { completed: false, score: 0 },
      level3: { completed: false, score: 0 },
      level4: { completed: false, score: 0 },
      level5: { completed: false, score: 0 }
    };
  },

  setLevelProgress(progress) {
    let profile = this.getProfile();
    if (!profile) {
      // Create a new profile if it doesn't exist
      const user = this.getUser();
      const defaultUsername = user ? `Player ${user.id}` : `Player ${Date.now()}`;
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
    
    return progress[prevLevel] && progress[prevLevel].completed;
  },

  // Update profile functions
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

    // Check if new username already exists
    const users = JSON.parse(localStorage.getItem('uxplore_users') || '[]');
    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== user.id)) {
      return false; // Username already taken
    }

    // Update the user
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

// Navigation
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

// Logout
function logout() {
  StorageManager.removeUser();
  StorageManager.setProfile(null);
  window.location.href = 'index.html';
}

// Hall of Fame functions
function getAllUsersWithScores() {
  const allUsersData = [];
  const profiles = JSON.parse(localStorage.getItem('uxplore_profiles') || '{}');

  // Get all profiles directly (not just those matching users)
  Object.keys(profiles).forEach(profileKey => {
    const profile = profiles[profileKey];
    
    if (profile && profile.gameUsername) {
      // Calculate total score
      const levelProgress = profile.levelProgress || {
        level1: { completed: false, score: 0 },
        level2: { completed: false, score: 0 },
        level3: { completed: false, score: 0 },
        level4: { completed: false, score: 0 },
        level5: { completed: false, score: 0 }
      };

      const totalScore = Object.values(levelProgress).reduce((sum, level) => {
        return sum + (level.completed ? level.score : 0);
      }, 0);

      const completedLevels = Object.values(levelProgress).filter(l => l.completed).length;

      allUsersData.push({
        gameUsername: profile.gameUsername,
        avatar: profile.avatar,
        totalScore: totalScore,
        completedLevels: completedLevels,
        levelScores: levelProgress
      });
    }
  });

  // Sort by total score (highest first)
  allUsersData.sort((a, b) => b.totalScore - a.totalScore);
  return allUsersData;
}

// Get rankings with positions
function getRankings() {
  const users = getAllUsersWithScores();
  return users.map((user, index) => ({
    ...user,
    rank: index + 1
  }));
}

// Avatar path helper - returns correct path based on current location
function getAvatarPath(avatarFilename) {
  // If it's an emoji or already a full path, return as-is
  if (!avatarFilename || avatarFilename.includes('/') || /\p{Emoji}/u.test(avatarFilename)) {
    return avatarFilename;
  }
  
  // Check if we're on a level page (inside levels/ directory)
  const isLevelPage = window.location.pathname.includes('/levels/');
  
  // Return path with proper prefix for level pages
  return isLevelPage ? '../' + avatarFilename : avatarFilename;
}

// Check authentication
function checkAuth() {
  const user = StorageManager.getUser();
  if (!user) {
    window.location.href = 'login.html';
  }
  displayUserInfo();
  return user;
}

// Display user info
function displayUserInfo() {
  const user = StorageManager.getUser();
  const profile = StorageManager.getProfile();
  
  if (user) {
    const userElement = document.getElementById('user-info');
    if (userElement) {
      const displayName = profile ? profile.gameUsername : user.username;
      const avatarFilename = profile ? profile.avatar : '👾';
      
      // Get correct avatar path based on current page location
      const avatarPath = getAvatarPath(avatarFilename);
      
      // Check if it's a file path (contains filename with extension) or emoji
      const isImageFile = avatarPath && (avatarPath.includes('.png') || avatarPath.includes('.jpg') || avatarPath.includes('.gif'));
      const avatarHTML = isImageFile
        ? `<img src="${avatarPath}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 4px; border: 1px solid var(--accent-cyan);">`
        : `<span>${avatarPath}</span>`;
      
      userElement.innerHTML = `
        <span style="margin-right: 0; display: flex; align-items: center; gap: 10px;">
          <span style="cursor: pointer; display: flex; align-items: center;" onclick="openEditProfileModal()">
            ${avatarHTML}
            <span style="margin-right: 15px;">${displayName}</span>
          </span>
          <button class="btn" onclick="navigateTo('halloffame')" style="padding: 8px 15px; font-size: 12px; margin-right: 5px;">🏆</button>
          <button class="btn" onclick="logout()" style="padding: 8px 15px; font-size: 12px;">Logout</button>
        </span>
      `;
    }
  }
}

// Edit Profile Modal Functions
function openEditProfileModal() {
  const profile = StorageManager.getProfile();
  if (!profile) return;

  const modal = document.getElementById('edit-profile-modal') || createEditModal();
  
  // Populate form with current values
  document.getElementById('edit-username').value = profile.gameUsername || '';
  document.getElementById('edit-account-username').value = StorageManager.getUser().username || '';
  
  // Show current avatar selection
  document.querySelectorAll('.edit-avatar-option').forEach(option => {
    option.classList.remove('selected');
    if (option.getAttribute('data-avatar') === profile.avatar) {
      option.classList.add('selected');
    }
  });
  
  modal.classList.add('active');
}

function createEditModal() {
  // Check if modal already exists
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
        <!-- Game Username -->
        <div class="form-group">
          <label for="edit-username">Game Username</label>
          <input type="text" id="edit-username" placeholder="Enter your gaming name" required>
        </div>

        <!-- Account Username -->
        <div class="form-group">
          <label for="edit-account-username">Account Username</label>
          <input type="text" id="edit-account-username" placeholder="Enter your account name" required>
        </div>

        <!-- Avatar Selection -->
        <div class="form-group">
          <label>Select Avatar</label>
          <div class="avatar-grid">
            <div class="edit-avatar-option" data-avatar="avatar-m.png" onclick="selectEditAvatar(this)" style="cursor: pointer;">
              <img src="${getAvatarPath('avatar-m.png')}" alt="Male Avatar 1" style="width: 60px; height: 60px; border-radius: 4px;">
            </div>
            <div class="edit-avatar-option" data-avatar="avatar-m2.png" onclick="selectEditAvatar(this)" style="cursor: pointer;">
              <img src="${getAvatarPath('avatar-m2.png')}" alt="Male Avatar 2" style="width: 60px; height: 60px; border-radius: 4px;">
            </div>
            <div class="edit-avatar-option" data-avatar="avatar-f.png" onclick="selectEditAvatar(this)" style="cursor: pointer;">
              <img src="${getAvatarPath('avatar-f.png')}" alt="Female Avatar 1" style="width: 60px; height: 60px; border-radius: 4px;">
            </div>
            <div class="edit-avatar-option" data-avatar="avatar-f2.png" onclick="selectEditAvatar(this)" style="cursor: pointer;">
              <img src="${getAvatarPath('avatar-f2.png')}" alt="Female Avatar 2" style="width: 60px; height: 60px; border-radius: 4px;">
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeEditProfileModal()" style="width: 100%; margin: 0;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin: 0;">Save Changes</button>
        </div>

        <p id="edit-message" style="text-align: center; margin-top: 15px; color: var(--success);"></p>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeEditProfileModal();
    }
  });

  return modal;
}

function selectEditAvatar(element) {
  document.querySelectorAll('.edit-avatar-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  element.classList.add('selected');
}

function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) {
    modal.classList.remove('active');
  }
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

  // Update game username
  if (!StorageManager.updateGameUsername(newGameUsername)) {
    showEditMessage('✗ Failed to update game username', 'error');
    return;
  }

  // Update account username
  if (!StorageManager.updateAccountUsername(newAccountUsername)) {
    showEditMessage('✗ Username already exists', 'error');
    return;
  }

  // Update avatar
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

// Quiz helpers
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

// Sound Effects using Web Audio API
const SoundManager = {
  // Create audio context
  audioContext: null,

  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  },

  // Play a tone with exact frequency and duration
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

  // Correct answer sound (ascending notes)
  playCorrect() {
    this.playTone(523.25, 0.1, 0, 0.3);     // C5
    this.playTone(659.25, 0.1, 0.1, 0.3);   // E5
    this.playTone(783.99, 0.15, 0.2, 0.3);  // G5
  },

  // Wrong answer sound (descending notes)
  playWrong() {
    this.playTone(523.25, 0.1, 0, 0.2);     // C5
    this.playTone(392.00, 0.1, 0.1, 0.2);   // G4
    this.playTone(261.63, 0.15, 0.2, 0.2);  // C4
  },

  // Quiz passed sound (celebratory)
  playPassed() {
    this.playTone(523.25, 0.15, 0, 0.3);    // C5
    this.playTone(659.25, 0.15, 0.15, 0.3); // E5
    this.playTone(783.99, 0.15, 0.3, 0.3);  // G5
    this.playTone(1046.5, 0.25, 0.45, 0.3); // C6
  },

  // Quiz failed sound (sad tones)
  playFailed() {
    this.playTone(349.23, 0.2, 0, 0.2);     // F4
    this.playTone(293.66, 0.2, 0.2, 0.2);   // D4
    this.playTone(246.94, 0.3, 0.4, 0.2);   // B3
  }
};

// Initialize page
window.addEventListener('DOMContentLoaded', () => {
  displayUserInfo();
  createEditModal(); // Pre-create the modal
});
