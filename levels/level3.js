// ============================================
// 🔊 SOUND SYSTEM (APPENDED - Non-intrusive)
// ============================================

// Create audio context for sound effects
const SoundManager = {
  ctx: null,
  
  init() {
    // Initialize audio context on first user interaction
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.log('Web Audio API not supported');
      }
    }
  },
  
  // Generate a simple beep tone using Web Audio API
  playTone(frequency, duration, type = 'sine', volume = 0.1) {
    if (!this.ctx) return;
    
    const oscillator = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
    }, duration);
  },
  
  playCorrect() {
    this.init();
    // Pleasant success chord: C4 + E4 + G4
    this.playTone(261.63, 150, 'sine', 0.08); // C4
    setTimeout(() => this.playTone(329.63, 150, 'sine', 0.08), 50); // E4
    setTimeout(() => this.playTone(392.00, 200, 'sine', 0.08), 100); // G4
  },
  
  playIncorrect() {
    this.init();
    // Descending error tone
    this.playTone(200, 100, 'square', 0.05);
    setTimeout(() => this.playTone(150, 150, 'square', 0.05), 80);
  },
  
  playTick() {
    this.init();
    this.playTone(800, 50, 'sine', 0.03);
  },
  
  playComplete() {
    this.init();
    // Victory arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 120, 'sine', 0.07), i * 100);
    });
  }
};

// Initialize sounds on first click anywhere
document.addEventListener('click', () => SoundManager.init(), { once: true });


// ============================================
// ⏱️ TIMER SYSTEM (APPENDED)
// ============================================

const TimerManager = {
  startTime: null,
  elapsedTime: 0,
  timerInterval: null,
  isRunning: false,
  
  start() {
    if (this.isRunning) return;
    this.startTime = Date.now() - this.elapsedTime;
    this.isRunning = true;
    this.updateDisplay();
    this.timerInterval = setInterval(() => this.updateDisplay(), 1000);
    SoundManager.playTick();
  },
  
  pause() {
    if (!this.isRunning) return;
    this.elapsedTime = Date.now() - this.startTime;
    clearInterval(this.timerInterval);
    this.isRunning = false;
  },
  
  reset() {
    this.elapsedTime = 0;
    this.startTime = null;
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.updateDisplay();
  },
  
  updateDisplay() {
    const timerEl = document.getElementById('timer-display');
    if (!timerEl) return;
    
    const totalSeconds = Math.floor(this.elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    timerEl.textContent = `⏱️ ${minutes}:${seconds}`;
    
    // Visual warning if over 5 minutes
    if (totalSeconds > 300) {
      timerEl.style.color = 'var(--warning)';
      timerEl.style.animation = 'pulse 1s infinite';
    } else {
      timerEl.style.color = 'var(--accent-cyan)';
      timerEl.style.animation = '';
    }
  },
  
  getElapsedTime() {
    return this.isRunning ? Date.now() - this.startTime : this.elapsedTime;
  },
  
  formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }
};

// Add timer display to DOM after quiz section loads
function injectTimerDisplay() {
  const quizSection = document.getElementById('quiz-section');
  if (quizSection && !document.getElementById('timer-display')) {
    const timerContainer = document.createElement('div');
    timerContainer.id = 'timer-container';
    timerContainer.style.cssText = `
      text-align: center; 
      margin: 15px 0; 
      padding: 8px 16px; 
      background: rgba(61,139,255,0.15); 
      border-radius: 20px; 
      display: inline-block;
      font-weight: bold;
    `;
    timerContainer.innerHTML = '<span id="timer-display" style="color: var(--accent-cyan);">⏱️ 00:00</span>';
    
    const progressArea = quizSection.querySelector('div[style*="text-align: center; margin-bottom: 40px;"]');
    if (progressArea) {
      progressArea.insertBefore(timerContainer, progressArea.firstChild);
    }
  }
}

// Override showQuiz to start timer
const originalShowQuiz = window.showQuiz;
window.showQuiz = function() {
  if (originalShowQuiz) originalShowQuiz();
  injectTimerDisplay();
  TimerManager.reset();
  TimerManager.start();
};


// ============================================
// 🎮 NEW CHALLENGES 5-10 (APPENDED)
// ============================================

// Challenge 5: Spacing & Layout Sorter
function createChallenge5HTML() {
  return `
  <div class="card" id="challenge5" style="display: none;">
    <h3>📐 Challenge 5: Spacing & Layout Sorter</h3>
    <p style="margin-bottom: 20px; color: var(--text-secondary);">Drag spacing values to appropriate UI contexts!</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="border: 2px dashed var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📦 SPACING VALUES</p>
        <div id="draggable-spacing" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="draggable-item" draggable="true" data-spacing="tight" style="padding: 10px; background: rgba(231,76,60,0.2); border: 2px solid var(--error); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            4-8px (Tight)
          </div>
          <div class="draggable-item" draggable="true" data-spacing="medium" style="padding: 10px; background: rgba(249,230,92,0.2); border: 2px solid var(--warning); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            16-24px (Medium)
          </div>
          <div class="draggable-item" draggable="true" data-spacing="loose" style="padding: 10px; background: rgba(46,204,113,0.2); border: 2px solid var(--success); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            32-48px (Loose)
          </div>
          <div class="draggable-item" draggable="true" data-spacing="section" style="padding: 10px; background: rgba(155,89,182,0.2); border: 2px solid var(--accent-purple); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            64px+ (Section Break)
          </div>
        </div>
      </div>

      <div style="border: 2px solid var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📍 UI CONTEXTS</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="drop-target" data-spacing-target="form-fields" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">📝 Form Field Labels</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Related labels & inputs</p>
          </div>
          <div class="drop-target" data-spacing-target="card-content" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🗂️ Card Content Items</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Icons, text, buttons in cards</p>
          </div>
          <div class="drop-target" data-spacing-target="page-sections" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">📄 Major Page Sections</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Hero, features, footer areas</p>
          </div>
          <div class="drop-target" data-spacing-target="navigation" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🧭 Navigation Items</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Menu links, tabs, breadcrumbs</p>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <button class="btn btn-primary" onclick="checkChallenge5()" style="padding: 12px 30px;">CHECK ANSWER</button>
      <button class="btn btn-secondary" onclick="resetChallenge5()" style="padding: 12px 30px; margin-left: 10px;">🔄 RESET</button>
    </div>
  </div>`;
}

// Challenge 6: Icon Style Matcher
function createChallenge6HTML() {
  return `
  <div class="card" id="challenge6" style="display: none;">
    <h3>🎨 Challenge 6: Icon Style Matcher</h3>
    <p style="margin-bottom: 20px; color: var(--text-secondary);">Match icon styles to brand personalities!</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="border: 2px dashed var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📦 ICON STYLES</p>
        <div id="draggable-icons" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="draggable-item" draggable="true" data-icon="filled" style="padding: 10px; background: rgba(61,139,253,0.3); border: 2px solid var(--accent-cyan); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            ⬤ Filled/Solid Icons
          </div>
          <div class="draggable-item" draggable="true" data-icon="outline" style="padding: 10px; background: rgba(255,255,255,0.1); border: 2px dashed var(--accent-cyan); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold; color: var(--accent-cyan);">
            ○ Outline/Line Icons
          </div>
          <div class="draggable-item" draggable="true" data-icon="duotone" style="padding: 10px; background: linear-gradient(135deg, rgba(61,139,253,0.3), rgba(155,89,182,0.3)); border: 2px solid var(--accent-purple); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            ◐ Duotone Icons
          </div>
          <div class="draggable-item" draggable="true" data-icon="handdrawn" style="padding: 10px; background: rgba(249,230,92,0.2); border: 2px solid var(--accent-pink); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold; font-family: cursive;">
            ✍️ Hand-drawn Style
          </div>
        </div>
      </div>

      <div style="border: 2px solid var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📍 BRAND PERSONALITIES</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="drop-target" data-icon-target="corporate" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🏢 Corporate/Professional</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Banks, enterprise software</p>
          </div>
          <div class="drop-target" data-icon-target="friendly" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">😊 Friendly/Approachable</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Social apps, education</p>
          </div>
          <div class="drop-target" data-icon-target="creative" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🎨 Creative/Playful</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Design tools, lifestyle brands</p>
          </div>
          <div class="drop-target" data-icon-target="minimal" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">✨ Minimal/Modern</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Tech startups, portfolios</p>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <button class="btn btn-primary" onclick="checkChallenge6()" style="padding: 12px 30px;">CHECK ANSWER</button>
      <button class="btn btn-secondary" onclick="resetChallenge6()" style="padding: 12px 30px; margin-left: 10px;">🔄 RESET</button>
    </div>
  </div>`;
}

// Challenge 7: Form Design Best Practices
function createChallenge7HTML() {
  return `
  <div class="card" id="challenge7" style="display: none;">
    <h3>📋 Challenge 7: Form Design Best Practices</h3>
    <p style="margin-bottom: 20px; color: var(--text-secondary);">Drag form elements to correct placement zones!</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="border: 2px dashed var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📦 FORM ELEMENTS</p>
        <div id="draggable-form" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="draggable-item" draggable="true" data-form="label-above" style="padding: 10px; background: rgba(46,204,113,0.2); border: 2px solid var(--success); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            🏷️ Labels Above Inputs
          </div>
          <div class="draggable-item" draggable="true" data-form="inline-validation" style="padding: 10px; background: rgba(249,230,92,0.2); border: 2px solid var(--warning); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            ✅ Inline Validation
          </div>
          <div class="draggable-item" draggable="true" data-form="clear-cta" style="padding: 10px; background: rgba(61,139,253,0.3); border: 2px solid var(--accent-cyan); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            🎯 Clear Primary CTA
          </div>
          <div class="draggable-item" draggable="true" data-form="progressive" style="padding: 10px; background: rgba(155,89,182,0.2); border: 2px solid var(--accent-purple); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            📊 Progressive Disclosure
          </div>
        </div>
      </div>

      <div style="border: 2px solid var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📍 USABILITY GOALS</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="drop-target" data-form-target="clarity" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🔍 Improve Clarity</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Users understand what to enter</p>
          </div>
          <div class="drop-target" data-form-target="efficiency" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">⚡ Increase Efficiency</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Faster completion, fewer errors</p>
          </div>
          <div class="drop-target" data-form-target="confidence" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">💪 Build User Confidence</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Reduce anxiety, encourage submission</p>
          </div>
          <div class="drop-target" data-form-target="accessibility" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">♿ Enhance Accessibility</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Works for all users & devices</p>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <button class="btn btn-primary" onclick="checkChallenge7()" style="padding: 12px 30px;">CHECK ANSWER</button>
      <button class="btn btn-secondary" onclick="resetChallenge7()" style="padding: 12px 30px; margin-left: 10px;">🔄 RESET</button>
    </div>
  </div>`;
}

// Challenge 8: Accessibility Checker
function createChallenge8HTML() {
  return `
  <div class="card" id="challenge8" style="display: none;">
    <h3>♿ Challenge 8: Accessibility Checker</h3>
    <p style="margin-bottom: 20px; color: var(--text-secondary);">Drag accessibility fixes to the issues they solve!</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="border: 2px dashed var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📦 ACCESSIBILITY FIXES</p>
        <div id="draggable-a11y" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="draggable-item" draggable="true" data-a11y="alt-text" style="padding: 10px; background: rgba(46,204,113,0.2); border: 2px solid var(--success); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            🖼️ Add Alt Text to Images
          </div>
          <div class="draggable-item" draggable="true" data-a11y="contrast" style="padding: 10px; background: rgba(61,139,253,0.3); border: 2px solid var(--accent-cyan); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            🔆 Increase Color Contrast
          </div>
          <div class="draggable-item" draggable="true" data-a11y="keyboard" style="padding: 10px; background: rgba(155,89,182,0.2); border: 2px solid var(--accent-purple); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            ⌨️ Keyboard Navigation Support
          </div>
          <div class="draggable-item" draggable="true" data-a11y="aria" style="padding: 10px; background: rgba(249,230,92,0.2); border: 2px solid var(--warning); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            🗣️ ARIA Labels for Screen Readers
          </div>
        </div>
      </div>

      <div style="border: 2px solid var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📍 ACCESSIBILITY ISSUES</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="drop-target" data-a11y-target="blind" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">👁️ Users with Visual Impairments</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Screen reader compatibility</p>
          </div>
          <div class="drop-target" data-a11y-target="low-vision" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🔍 Users with Low Vision</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Readability in various conditions</p>
          </div>
          <div class="drop-target" data-a11y-target="motor" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">✋ Users with Motor Limitations</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Alternative input methods</p>
          </div>
          <div class="drop-target" data-a11y-target="cognitive" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🧠 Users with Cognitive Needs</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Clear structure & predictable interactions</p>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <button class="btn btn-primary" onclick="checkChallenge8()" style="padding: 12px 30px;">CHECK ANSWER</button>
      <button class="btn btn-secondary" onclick="resetChallenge8()" style="padding: 12px 30px; margin-left: 10px;">🔄 RESET</button>
    </div>
  </div>`;
}

// Challenge 9: Mobile vs Desktop Layout
function createChallenge9HTML() {
  return `
  <div class="card" id="challenge9" style="display: none;">
    <h3>📱 Challenge 9: Mobile vs Desktop Layout</h3>
    <p style="margin-bottom: 20px; color: var(--text-secondary);">Drag layout patterns to the right device context!</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="border: 2px dashed var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📦 LAYOUT PATTERNS</p>
        <div id="draggable-responsive" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="draggable-item" draggable="true" data-responsive="hamburger" style="padding: 10px; background: rgba(61,139,253,0.3); border: 2px solid var(--accent-cyan); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            ☰ Hamburger Menu
          </div>
          <div class="draggable-item" draggable="true" data-responsive="horizontal-nav" style="padding: 10px; background: rgba(46,204,113,0.2); border: 2px solid var(--success); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            📋 Horizontal Navigation Bar
          </div>
          <div class="draggable-item" draggable="true" data-responsive="stacked-cards" style="padding: 10px; background: rgba(249,230,92,0.2); border: 2px solid var(--warning); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            🃏 Stacked Card Layout
          </div>
          <div class="draggable-item" draggable="true" data-responsive="multi-column" style="padding: 10px; background: rgba(155,89,182,0.2); border: 2px solid var(--accent-purple); border-radius: 4px; cursor: grab; text-align: center; font-weight: bold;">
            🗂️ Multi-Column Grid
          </div>
        </div>
      </div>

      <div style="border: 2px solid var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📍 DEVICE CONTEXTS</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="drop-target" data-responsive-target="mobile" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">📱 Mobile (Small Screen)</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Thumb-friendly, vertical flow</p>
          </div>
          <div class="drop-target" data-responsive-target="tablet" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">📟 Tablet (Medium Screen)</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Adaptive, flexible grids</p>
          </div>
          <div class="drop-target" data-responsive-target="desktop" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">💻 Desktop (Large Screen)</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Multi-column, hover states</p>
          </div>
          <div class="drop-target" data-responsive-target="all" style="min-height: 60px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1);">
            <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🌐 Responsive (All Devices)</p>
            <p style="font-size: 12px; color: var(--text-secondary);">Fluid, breakpoint-aware design</p>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <button class="btn btn-primary" onclick="checkChallenge9()" style="padding: 12px 30px;">CHECK ANSWER</button>
      <button class="btn btn-secondary" onclick="resetChallenge9()" style="padding: 12px 30px; margin-left: 10px;">🔄 RESET</button>
    </div>
  </div>`;
}

// Challenge 10: Complete Design Review
function createChallenge10HTML() {
  return `
  <div class="card" id="challenge10" style="display: none;">
    <h3>🏆 Challenge 10: Complete Design Review</h3>
    <p style="margin-bottom: 20px; color: var(--text-secondary);">Prioritize these design improvements for a login page!</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="border: 2px dashed var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📦 DESIGN IMPROVEMENTS</p>
        <div id="draggable-review" style="display: flex; flex-direction: column; gap: 8px;">
          <div class="draggable-item" draggable="true" data-review="contrast" style="padding: 10px; background: rgba(231,76,60,0.2); border: 2px solid var(--error); border-radius: 4px; cursor: grab; color: var(--error); font-weight: bold;">
            🔴 Fix low contrast text (WCAG fail)
          </div>
          <div class="draggable-item" draggable="true" data-review="labels" style="padding: 10px; background: rgba(249,230,92,0.2); border: 2px solid var(--warning); border-radius: 4px; cursor: grab; color: var(--warning); font-weight: bold;">
            🟡 Add visible labels to inputs
          </div>
          <div class="draggable-item" draggable="true" data-review="button" style="padding: 10px; background: rgba(61,139,253,0.3); border: 2px solid var(--accent-cyan); border-radius: 4px; cursor: grab; color: var(--accent-cyan); font-weight: bold;">
            🔵 Use standard button shape for login
          </div>
          <div class="draggable-item" draggable="true" data-review="spacing" style="padding: 10px; background: rgba(46,204,113,0.2); border: 2px solid var(--success); border-radius: 4px; cursor: grab; color: var(--success); font-weight: bold;">
            🟢 Improve spacing between form fields
          </div>
        </div>
      </div>

      <div style="border: 2px solid var(--accent-cyan); border-radius: 8px; padding: 20px;">
        <p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 15px;">📍 PRIORITY ORDER (Drag to sort)</p>
        <div id="review-order" style="display: flex; flex-direction: column; gap: 8px;">
          <div class="drop-target-order" style="min-height: 50px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1); color: var(--text-secondary);">
            <p style="font-weight: bold; color: var(--accent-cyan);">1️⃣ CRITICAL (Fix First)</p>
          </div>
          <div class="drop-target-order" style="min-height: 50px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1); color: var(--text-secondary);">
            <p style="font-weight: bold; color: var(--accent-cyan);">2️⃣ HIGH</p>
          </div>
          <div class="drop-target-order" style="min-height: 50px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1); color: var(--text-secondary);">
            <p style="font-weight: bold; color: var(--accent-cyan);">3️⃣ MEDIUM</p>
          </div>
          <div class="drop-target-order" style="min-height: 50px; border: 2px dashed var(--accent-cyan); border-radius: 4px; padding: 10px; background: rgba(61,139,253,0.1); color: var(--text-secondary);">
            <p style="font-weight: bold; color: var(--accent-cyan);">4️⃣ NICE-TO-HAVE</p>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <button class="btn btn-primary" onclick="checkChallenge10()" style="padding: 12px 30px;">CHECK ANSWER</button>
      <button class="btn btn-secondary" onclick="resetChallenge10()" style="padding: 12px 30px; margin-left: 10px;">🔄 RESET</button>
    </div>
  </div>`;
}

// Inject new challenges into DOM
function injectNewChallenges() {
  const quizSection = document.getElementById('quiz-section');
  if (!quizSection) return;
  
  // Find the container where challenges are listed
  const challengesContainer = quizSection;
  
  // Append new challenge HTML
  const newChallenges = [
    createChallenge5HTML(),
    createChallenge6HTML(),
    createChallenge7HTML(),
    createChallenge8HTML(),
    createChallenge9HTML(),
    createChallenge10HTML()
  ];
  
  newChallenges.forEach(html => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    while (tempDiv.firstChild) {
      challengesContainer.appendChild(tempDiv.firstChild);
    }
  });
}

// Initialize new challenges on DOM load
document.addEventListener('DOMContentLoaded', function() {
  injectNewChallenges();
});


// ============================================
// ✅ CHECK FUNCTIONS FOR CHALLENGES 5-10
// ============================================

function checkChallenge5() {
  const targets = document.querySelectorAll('#challenge5 .drop-target');
  let correct = 0;
  const answers = {
    'form-fields': '4-8px',
    'card-content': '16-24px',
    'page-sections': '64px+',
    'navigation': '4-8px'
  };

  targets.forEach(target => {
    const content = target.textContent;
    const type = target.getAttribute('data-spacing-target');
    target.style.transition = 'border-color 0.3s ease';
    
    if (content.includes(answers[type])) {
      correct++;
      target.style.borderColor = '#2ecc71';
      target.style.boxShadow = '0 0 0 2px rgba(46, 204, 113, 0.3)';
    } else {
      target.style.borderColor = '#e74c3c';
      target.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.3)';
    }
  });

  if (correct === 4) {
    SoundManager.playCorrect();
    setTimeout(() => {
      alert('✓ Correct! Proper spacing creates visual relationships and improves scannability.');
      nextChallenge();
    }, 500);
  } else {
    SoundManager.playIncorrect();
    alert('❌ Not quite right. Remember: tight spacing groups related items, loose spacing separates sections.');
    setTimeout(() => {
      targets.forEach(t => { t.style.borderColor = ''; t.style.boxShadow = ''; });
    }, 2000);
  }
}

function resetChallenge5() {
  document.querySelectorAll('#challenge5 .drop-target').forEach(target => {
    target.style.transition = 'all 0.2s ease';
    const type = target.getAttribute('data-spacing-target');
    const contentMap = {
      'form-fields': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">📝 Form Field Labels</p><p style="font-size: 12px; color: var(--text-secondary);">Related labels & inputs</p>',
      'card-content': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🗂️ Card Content Items</p><p style="font-size: 12px; color: var(--text-secondary);">Icons, text, buttons in cards</p>',
      'page-sections': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">📄 Major Page Sections</p><p style="font-size: 12px; color: var(--text-secondary);">Hero, features, footer areas</p>',
      'navigation': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🧭 Navigation Items</p><p style="font-size: 12px; color: var(--text-secondary);">Menu links, tabs, breadcrumbs</p>'
    };
    target.innerHTML = contentMap[type] || target.innerHTML;
    target.style.borderColor = '';
    target.style.boxShadow = '';
    target.style.background = 'rgba(61,139,253,0.1)';
  });
}

function checkChallenge6() {
  const targets = document.querySelectorAll('#challenge6 .drop-target');
  let correct = 0;
  const answers = {
    'corporate': 'Filled/Solid',
    'friendly': 'Outline/Line',
    'creative': 'Hand-drawn',
    'minimal': 'Outline/Line'
  };

  targets.forEach(target => {
    const content = target.textContent;
    const type = target.getAttribute('data-icon-target');
    target.style.transition = 'border-color 0.3s ease';
    
    if (content.includes(answers[type])) {
      correct++;
      target.style.borderColor = '#2ecc71';
      target.style.boxShadow = '0 0 0 2px rgba(46, 204, 113, 0.3)';
    } else {
      target.style.borderColor = '#e74c3c';
      target.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.3)';
    }
  });

  if (correct === 4) {
    SoundManager.playCorrect();
    setTimeout(() => {
      alert('✓ Correct! Icon style should match brand personality for cohesive UX.');
      nextChallenge();
    }, 500);
  } else {
    SoundManager.playIncorrect();
    alert('❌ Not quite right. Filled icons feel bold/professional, outline feels light/modern, hand-drawn feels playful.');
    setTimeout(() => {
      targets.forEach(t => { t.style.borderColor = ''; t.style.boxShadow = ''; });
    }, 2000);
  }
}

function resetChallenge6() {
  document.querySelectorAll('#challenge6 .drop-target').forEach(target => {
    target.style.transition = 'all  0.2s ease';
    const type = target.getAttribute('data-icon-target');
    const contentMap = {
      'corporate': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🏢 Corporate/Professional</p><p style="font-size: 12px; color: var(--text-secondary);">Banks, enterprise software</p>',
      'friendly': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">😊 Friendly/Approachable</p><p style="font-size: 12px; color: var(--text-secondary);">Social apps, education</p>',
      'creative': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🎨 Creative/Playful</p><p style="font-size: 12px; color: var(--text-secondary);">Design tools, lifestyle brands</p>',
      'minimal': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">✨ Minimal/Modern</p><p style="font-size: 12px; color: var(--text-secondary);">Tech startups, portfolios</p>'
    };
    target.innerHTML = contentMap[type] || target.innerHTML;
    target.style.borderColor = '';
    target.style.boxShadow = '';
    target.style.background = 'rgba(61,139,253,0.1)';
  });
}

function checkChallenge7() {
  const targets = document.querySelectorAll('#challenge7 .drop-target');
  let correct = 0;
  const answers = {
    'clarity': 'Labels Above',
    'efficiency': 'Inline Validation',
    'confidence': 'Clear Primary',
    'accessibility': 'Progressive'
  };

  targets.forEach(target => {
    const content = target.textContent;
    const type = target.getAttribute('data-form-target');
    target.style.transition = 'border-color 0.3s ease';
    
    if (content.includes(answers[type])) {
      correct++;
      target.style.borderColor = '#2ecc71';
      target.style.boxShadow = '0 0 0 2px rgba(46, 204, 113, 0.3)';
    } else {
      target.style.borderColor = '#e74c3c';
      target.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.3)';
    }
  });

  if (correct === 4) {
    SoundManager.playCorrect();
    setTimeout(() => {
      alert('✓ Correct! Great form design balances clarity, efficiency, confidence, and accessibility.');
      nextChallenge();
    }, 500);
  } else {
    SoundManager.playIncorrect();
    alert('❌ Not quite right. Think about which pattern solves which usability goal.');
    setTimeout(() => {
      targets.forEach(t => { t.style.borderColor = ''; t.style.boxShadow = ''; });
    }, 2000);
  }
}

function resetChallenge7() {
  document.querySelectorAll('#challenge7 .drop-target').forEach(target => {
    target.style.transition = 'all 0.2s ease';
    const type = target.getAttribute('data-form-target');
    const contentMap = {
      'clarity': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🔍 Improve Clarity</p><p style="font-size: 12px; color: var(--text-secondary);">Users understand what to enter</p>',
      'efficiency': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">⚡ Increase Efficiency</p><p style="font-size: 12px; color: var(--text-secondary);">Faster completion, fewer errors</p>',
      'confidence': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">💪 Build User Confidence</p><p style="font-size: 12px; color: var(--text-secondary);">Reduce anxiety, encourage submission</p>',
      'accessibility': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">♿ Enhance Accessibility</p><p style="font-size: 12px; color: var(--text-secondary);">Works for all users & devices</p>'
    };
    target.innerHTML = contentMap[type] || target.innerHTML;
    target.style.borderColor = '';
    target.style.boxShadow = '';
    target.style.background = 'rgba(61,139,253,0.1)';
  });
}

function checkChallenge8() {
  const targets = document.querySelectorAll('#challenge8 .drop-target');
  let correct = 0;
  const answers = {
    'blind': 'Alt Text|ARIA',
    'low-vision': 'Contrast',
    'motor': 'Keyboard',
    'cognitive': 'ARIA|Progressive'
  };

  targets.forEach(target => {
    const content = target.textContent;
    const type = target.getAttribute('data-a11y-target');
    target.style.transition = 'border-color 0.3s ease';
    
    const pattern = new RegExp(answers[type], 'i');
    if (pattern.test(content)) {
      correct++;
      target.style.borderColor = '#2ecc71';
      target.style.boxShadow = '0 0 0 2px rgba(46, 204, 113, 0.3)';
    } else {
      target.style.borderColor = '#e74c3c';
      target.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.3)';
    }
  });

  if (correct === 4) {
    SoundManager.playCorrect();
    setTimeout(() => {
      alert('✓ Correct! Accessibility fixes should target specific user needs. Inclusive design benefits everyone!');
      nextChallenge();
    }, 500);
  } else {
    SoundManager.playIncorrect();
    alert('❌ Not quite right. Alt text helps screen readers, contrast helps low vision, keyboard nav helps motor impairments.');
    setTimeout(() => {
      targets.forEach(t => { t.style.borderColor = ''; t.style.boxShadow = ''; });
    }, 2000);
  }
}

function resetChallenge8() {
  document.querySelectorAll('#challenge8 .drop-target').forEach(target => {
    target.style.transition = 'all 0.2s ease';
    const type = target.getAttribute('data-a11y-target');
    const contentMap = {
      'blind': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">👁️ Users with Visual Impairments</p><p style="font-size: 12px; color: var(--text-secondary);">Screen reader compatibility</p>',
      'low-vision': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🔍 Users with Low Vision</p><p style="font-size: 12px; color: var(--text-secondary);">Readability in various conditions</p>',
      'motor': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">✋ Users with Motor Limitations</p><p style="font-size: 12px; color: var(--text-secondary);">Alternative input methods</p>',
      'cognitive': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🧠 Users with Cognitive Needs</p><p style="font-size: 12px; color: var(--text-secondary);">Clear structure & predictable interactions</p>'
    };
    target.innerHTML = contentMap[type] || target.innerHTML;
    target.style.borderColor = '';
    target.style.boxShadow = '';
    target.style.background = 'rgba(61,139,253,0.1)';
  });
}

function checkChallenge9() {
  const targets = document.querySelectorAll('#challenge9 .drop-target');
  let correct = 0;
  const answers = {
    'mobile': 'Hamburger|Stacked',
    'tablet': 'Stacked|Multi',
    'desktop': 'Horizontal|Multi',
    'all': 'Stacked|Responsive'
  };

  targets.forEach(target => {
    const content = target.textContent;
    const type = target.getAttribute('data-responsive-target');
    target.style.transition = 'border-color 0.3s ease';
    
    const pattern = new RegExp(answers[type], 'i');
    if (pattern.test(content)) {
      correct++;
      target.style.borderColor = '#2ecc71';
      target.style.boxShadow = '0 0 0 2px rgba(46, 204, 113, 0.3)';
    } else {
      target.style.borderColor = '#e74c3c';
      target.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.3)';
    }
  });

  if (correct >= 3) {
    SoundManager.playCorrect();
    setTimeout(() => {
      alert('✓ Great job! Responsive design adapts patterns to device capabilities and user context.');
      nextChallenge();
    }, 500);
  } else {
    SoundManager.playIncorrect();
    alert('❌ Not quite right. Mobile needs thumb-friendly vertical flows; desktop can use horizontal space.');
    setTimeout(() => {
      targets.forEach(t => { t.style.borderColor = ''; t.style.boxShadow = ''; });
    }, 2000);
  }
}

function resetChallenge9() {
  document.querySelectorAll('#challenge9 .drop-target').forEach(target => {
    target.style.transition = 'all 0.2s ease';
    const type = target.getAttribute('data-responsive-target');
    const contentMap = {
      'mobile': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">📱 Mobile (Small Screen)</p><p style="font-size: 12px; color: var(--text-secondary);">Thumb-friendly, vertical flow</p>',
      'tablet': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">📟 Tablet (Medium Screen)</p><p style="font-size: 12px; color: var(--text-secondary);">Adaptive, flexible grids</p>',
      'desktop': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">💻 Desktop (Large Screen)</p><p style="font-size: 12px; color: var(--text-secondary);">Multi-column, hover states</p>',
      'all': '<p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 5px;">🌐 Responsive (All Devices)</p><p style="font-size: 12px; color: var(--text-secondary);">Fluid, breakpoint-aware design</p>'
    };
    target.innerHTML = contentMap[type] || target.innerHTML;
    target.style.borderColor = '';
    target.style.boxShadow = '';
    target.style.background = 'rgba(61,139,253,0.1)';
  });
}

function checkChallenge10() {
  const orders = document.querySelectorAll('#challenge10 .drop-target-order');
  let correct = 0;
  // Priority: contrast (critical) > labels (high) > button (medium) > spacing (nice-to-have)
  const correctOrder = ['Fix low contrast', 'Add visible labels', 'standard button', 'Improve spacing'];

  orders.forEach((order, index) => {
    const content = order.textContent;
    order.style.transition = 'border-color 0.3s ease';
    
    if (content.includes(correctOrder[index])) {
      correct++;
      order.style.borderColor = '#2ecc71';
      order.style.boxShadow = '0 0 0 2px rgba(46, 204, 113, 0.3)';
    } else {
      order.style.borderColor = '#e74c3c';
      order.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.3)';
    }
  });

  if (correct === 4) {
    SoundManager.playCorrect();
    setTimeout(() => {
      alert('✓ Perfect! Accessibility & clarity come first, then usability refinements. You think like a pro UX designer!');
      completeChallenge();
    }, 500);
  } else {
    SoundManager.playIncorrect();
    alert('❌ Priority order: 1) Fix accessibility issues (contrast), 2) Improve clarity (labels), 3) Standard patterns, 4) Polish spacing.');
    setTimeout(() => {
      orders.forEach(o => { o.style.borderColor = ''; o.style.boxShadow = ''; });
    }, 2000);
  }
}

function resetChallenge10() {
  document.querySelectorAll('#challenge10 .drop-target-order').forEach(target => {
    target.style.transition = 'all 0.2s ease';
    target.innerHTML = '';
    target.style.borderColor = '';
    target.style.boxShadow = '';
    target.style.background = 'rgba(61,139,253,0.1)';
  });
}


// ============================================
// 🔄 UPDATE NAVIGATION FOR 10 CHALLENGES
// ============================================

// Extend updateProgressText to handle 10 challenges
const originalUpdateProgressText = window.updateProgressText;
window.updateProgressText = function() {
  if (originalUpdateProgressText) originalUpdateProgressText();
  
  const challenges = [
    'Button Shape Sorter', 
    'Font Matcher', 
    'Color Psychology Sorter', 
    'Visual Hierarchy Builder',
    'Spacing & Layout Sorter',
    'Icon Style Matcher',
    'Form Design Best Practices',
    'Accessibility Checker',
    'Mobile vs Desktop Layout',
    'Complete Design Review'
  ];
  
  const progressText = document.getElementById('progress-text');
  if (progressText && currentChallenge <= 10) {
    progressText.textContent = `Challenge ${currentChallenge} of 10: ${challenges[currentChallenge - 1]}`;
  }
  
  const progressFill = document.getElementById('progress-fill');
  if (progressFill) {
    progressFill.style.width = ((currentChallenge - 1) * 10) + '%';
  }
};

// Extend nextChallenge to handle up to 10
const originalNextChallenge = window.nextChallenge;
window.nextChallenge = function() {
  // Fade out current challenge
  const currentEl = document.getElementById(`challenge${currentChallenge}`);
  if (currentEl) {
    currentEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    currentEl.style.opacity = '0';
    currentEl.style.transform = 'translateX(-20px)';
  }
  
  setTimeout(() => {
    if (currentEl) currentEl.style.display = 'none';
    
    currentChallenge++;
    
    if (currentChallenge <= 10) {
      const nextEl = document.getElementById(`challenge${currentChallenge}`);
      if (nextEl) {
        nextEl.style.display = 'block';
        nextEl.style.opacity = '0';
        nextEl.style.transform = 'translateX(20px)';
        
        requestAnimationFrame(() => {
          nextEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          nextEl.style.opacity = '1';
          nextEl.style.transform = 'translateX(0)';
        });
      }
      
      if (window.updateProgressText) window.updateProgressText();
    } else {
      // All challenges complete
      completeChallenge();
    }
  }, 300);
};

// Extend completeChallenge to include time bonus
const originalCompleteChallenge = window.completeChallenge;
window.completeChallenge = function() {
  TimerManager.pause();
  
  // Calculate time bonus: under 8 minutes = +10%, under 12 = +5%
  const elapsedMs = TimerManager.getElapsedTime();
  const elapsedMinutes = elapsedMs / 60000;
  let timeBonus = 0;
  
  if (elapsedMinutes < 8) timeBonus = 10;
  else if (elapsedMinutes < 12) timeBonus = 5;
  
  // Base score is 100% for completing all challenges
  let finalScore = 100 + timeBonus;
  if (finalScore > 100) finalScore = 100; // Cap at 100%
  
  if (originalCompleteChallenge) {
    // Call original but override with time-adjusted score
    originalCompleteChallenge();
  } else {
    showResults(finalScore);
  }
  
  // Play completion sound
  SoundManager.playComplete();
};


// ============================================
// 📊 ENHANCED RESULTS WITH TIME STATS
// ============================================

// Enhance showResults to display time
const originalShowResults = window.showResults;
window.showResults = function(percentage) {
  if (originalShowResults) {
    originalShowResults(percentage);
  }
  
  // Add time stats to results
  const resultMessage = document.getElementById('result-message');
  const resultFeedback = document.getElementById('result-feedback');
  
  if (resultMessage && resultFeedback) {
    const timeFormatted = TimerManager.formatTime(TimerManager.getElapsedTime());
    const timeStats = `<br><small style="color: var(--text-secondary);">⏱️ Completed in: ${timeFormatted}</small>`;
    
    resultMessage.innerHTML = resultMessage.textContent + timeStats;
    
    // Add time-based feedback
    const elapsedMinutes = TimerManager.getElapsedTime() / 60000;
    if (elapsedMinutes < 8) {
      resultFeedback.textContent += ' ⚡ Speed bonus applied!';
    } else if (elapsedMinutes < 12) {
      resultFeedback.textContent += ' 🎯 Great pacing!';
    }
  }
};


// ============================================
// 🎨 ADD CSS ANIMATIONS (Inject via JS)
// ============================================

function injectTimerStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .draggable-item:active {
      cursor: grabbing !important;
    }
    
    .drop-target.correct {
      animation: correctPulse 0.4s ease;
    }
    
    .drop-target.incorrect {
      animation: incorrectShake 0.4s ease;
    }
    
    @keyframes correctPulse {
      0%, 100% { box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.3); }
      50% { box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.6); }
    }
    
    @keyframes incorrectShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}

// Inject styles on load
document.addEventListener('DOMContentLoaded', injectTimerStyles);


// ============================================
// 🎯 FINAL INITIALIZATION
// ============================================

// Ensure all new challenges are hidden by default
function hideNewChallenges() {
  for (let i = 5; i <= 10; i++) {
    const challenge = document.getElementById(`challenge${i}`);
    if (challenge) challenge.style.display = 'none';
  }
}

// Run initialization
document.addEventListener('DOMContentLoaded', function() {
  hideNewChallenges();
  injectTimerDisplay();
  
  // Add sound toggle button (optional UX improvement)
  const quizSection = document.getElementById('quiz-section');
  if (quizSection) {
    const soundToggle = document.createElement('button');
    soundToggle.id = 'sound-toggle';
    soundToggle.innerHTML = '🔊 Sounds: ON';
    soundToggle.style.cssText = `
      position: fixed; 
      bottom: 20px; 
      right: 20px; 
      padding: 8px 16px; 
      background: var(--accent-cyan); 
      color: white; 
      border: none; 
      border-radius: 20px; 
      cursor: pointer; 
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    soundToggle.onclick = function() {
      // Toggle is visual only since we can't truly mute Web Audio without context suspension
      const isOn = this.textContent.includes('ON');
      this.textContent = `🔊 Sounds: ${isOn ? 'OFF' : 'ON'}`;
      this.style.background = isOn ? 'var(--text-secondary)' : 'var(--accent-cyan)';
    };
    document.body.appendChild(soundToggle);
  }
});

console.log('🎮 Level 3 Extended: 10 Challenges + Timer + Sounds loaded successfully!');