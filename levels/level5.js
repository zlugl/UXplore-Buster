checkAuth();

const debugChallenges = [
  {
    id: 1,
    title: "🐛 Challenge 1: Unclosed Tag",
    description: "Look at the buggy HTML. The paragraph tag is not properly closed before the div closes.",
    buggyCode: `<div class="card">
  <p>This is a paragraph
  <p>Another paragraph</p>
</div>`,
    expectedFix: `<div class="card">
  <p>This is a paragraph</p>
  <p>Another paragraph</p>
</div>`,
    bugs: [
      "First &lt;p&gt; tag is not closed",
      "Should be: &lt;p&gt;...&lt;/p&gt;",
    ],
    hints: "Look for tags that don't have proper closing tags",
    points: 25
  },
  {
    id: 2,
    title: "🐛 Challenge 2: Missing Input Type",
    description: "The input field is missing the type attribute. Add type='email' to make it an email input.",
    buggyCode: `<form>
  <input placeholder="Enter your email">
  <button>Submit</button>
</form>`,
    expectedFix: `<form>
  <input type="email" placeholder="Enter your email">
  <button>Submit</button>
</form>`,
    bugs: [
      "Input missing type attribute",
      "Should be: type=\"email\"",
      "This improves accessibility and mobile keyboard"
    ],
    hints: "HTML inputs need a type attribute for proper validation",
    points: 25
  },
  {
    id: 3,
    title: "🐛 Challenge 3: Missing alt Attribute",
    description: "Images need alt text for accessibility. Add descriptive alt text to the image tag.",
    buggyCode: `<div class="product">
  <img src="product.jpg">
  <h3>Amazing Product</h3>
  <p>$29.99</p>
</div>`,
    expectedFix: `<div class="product">
  <img src="product.jpg" alt="Amazing Product">
  <h3>Amazing Product</h3>
  <p>$29.99</p>
</div>`,
    bugs: [
      "Image missing alt attribute",
      "Alt text helps screen readers and SEO",
      "Should describe what the image shows"
    ],
    hints: "All img tags must have meaningful alt text",
    points: 25
  },
  {
    id: 4,
    title: "🐛 Challenge 4: Fixed Height Overflow",
    description: "The CSS height is too small, cutting off content. Use min-height instead.",
    buggyCode: `<style>
  .box {
    height: 80px;
    padding: 15px;
    border: 1px solid cyan;
    overflow: hidden;
  }
</style>
<div class="box">
  <h3>Title</h3>
  <p>This is content that might be long</p>
</div>`,
    expectedFix: `<style>
  .box {
    min-height: 80px;
    padding: 15px;
    border: 1px solid cyan;
  }
</style>
<div class="box">
  <h3>Title</h3>
  <p>This is content that might be long</p>
</div>`,
    bugs: [
      "height: 80px is too restrictive",
      "overflow: hidden cuts off content",
      "Use min-height for flexible sizing"
    ],
    hints: "Use min-height instead of fixed height for content containers",
    points: 25
  }
];

let debugCompletedChallenges = {};

function startDebugChallenges() {
  document.getElementById('lecture-section').style.display = 'none';
  document.getElementById('debug-challenges-section').style.display = 'block';
  renderDebugChallenges();
}

function renderDebugChallenges() {
  var container = document.getElementById('debug-challenges-container');
  if (!container) {
    console.error('Container not found');
    return;
  }
  
  container.innerHTML = '';

  // Find the first incomplete challenge
  var currentChallenge = null;
  for (var i = 0; i < debugChallenges.length; i++) {
    if (!debugCompletedChallenges[debugChallenges[i].id]) {
      currentChallenge = debugChallenges[i];
      break;
    }
  }

  // If all challenges completed
  if (!currentChallenge) {
    container.innerHTML = '<p style="text-align: center; color: #000000; padding: 40px; font-size: 20px; font-weight: bold;">🎉 ALL DEBUGGING CHALLENGES COMPLETED!</p>';
    return;
  }

  var challengeDiv = document.createElement('div');
  challengeDiv.className = 'debug-challenge-card';
  challengeDiv.id = 'debug-challenge-' + currentChallenge.id;
  
  var html = '<h3>' + currentChallenge.title + '</h3>';
  html += '<p style="color: #000000; margin-bottom: 15px; font-size: 15px;">' + currentChallenge.description + '</p>';
  html += '<p style="color: #000000; font-weight: bold; margin-bottom: 10px; font-size: 14px;">Challenge ' + currentChallenge.id + ' of 4</p>';
  
  // Buggy code section
  html += '<div style="margin-bottom: 20px;">';
  html += '<div class="code-header" style="background: rgba(231, 76, 60, 0.2); color: #000000; border-bottom: 2px solid #e74c3c;">❌ BUGGY CODE (Debug This)</div>';
  html += '<textarea id="debug-fix-' + currentChallenge.id + '" class="debug-textarea" style="width: 100%; padding: 12px; background: #ffffff; color: #000000; border: 2px solid #3d8bfd; font-family: monospace; font-size: 13px; min-height: 180px; border-radius: 4px; box-sizing: border-box;">' + currentChallenge.buggyCode + '</textarea>';
  html += '</div>';
  
  // Bugs list and hint
  html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">';
  
  html += '<div>';
  html += '<h4 style="color: #000000; margin-bottom: 10px; font-size: 14px; font-weight: bold;">🔴 Bugs to Find:</h4>';
  html += '<ul class="bug-list" style="color: #000000; margin: 0; padding: 0;">';
  for (var i = 0; i < currentChallenge.bugs.length; i++) {
    html += '<li style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; padding: 8px; margin: 6px 0; border-radius: 2px; font-size: 12px; color: #000000;">• ' + currentChallenge.bugs[i] + '</li>';
  }
  html += '</ul>';
  html += '</div>';
  
  html += '<div>';
  html += '<div class="hints-box" style="background: rgba(61, 139, 253, 0.1); border-left: 3px solid #3d8bfd; padding: 12px; border-radius: 4px; height: 100%;">';
  html += '<strong style="color: #000000; font-size: 13px;">💡 Hint:</strong>';
  html += '<p style="margin: 8px 0 0 0; color: #000000; font-size: 12px; line-height: 1.5;">' + currentChallenge.hints + '</p>';
  html += '</div>';
  html += '</div>';
  
  html += '</div>';
  
  // Action buttons
  html += '<div style="display: flex; gap: 10px; margin-bottom: 15px;">';
  html += '<button class="btn btn-primary" onclick="checkDebugFix(' + currentChallenge.id + ')" style="flex: 1; padding: 12px;">✓ CHECK FIX</button>';
  html += '<button class="btn btn-secondary" onclick="showDebugAnswer(' + currentChallenge.id + ')" style="flex: 1; padding: 12px;">👀 SHOW ANSWER</button>';
  html += '<button class="btn btn-secondary" onclick="skipDebugChallenge(' + currentChallenge.id + ')" style="flex: 1; padding: 12px;">⏭ SKIP</button>';
  html += '</div>';
  html += '<div id="debug-status-' + currentChallenge.id + '"></div>';
  
  challengeDiv.innerHTML = html;
  container.appendChild(challengeDiv);
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function checkDebugFix(challengeId) {
  var challenge = debugChallenges.find(c => c.id === challengeId);
  if (!challenge) return;
  
  var userCode = document.getElementById('debug-fix-' + challengeId).value;
  var statusDiv = document.getElementById('debug-status-' + challengeId);
  
  // Normalize whitespace for comparison
  var normalizedUser = userCode.replace(/\s+/g, ' ').trim();
  var normalizedExpected = challenge.expectedFix.replace(/\s+/g, ' ').trim();
  
  // Check if fix is correct (flexible matching)
  var isCorrect = false;
  
  // Exact match or close match
  if (normalizedUser === normalizedExpected) {
    isCorrect = true;
  } else {
    // More flexible: check if all key parts are present
    var keyParts = [];
    if (challengeId === 1) {
      keyParts = ['</p>', '<p>'];  // Both p tags closed
    } else if (challengeId === 2) {
      keyParts = ['type="email"', 'input'];  // Email type
    } else if (challengeId === 3) {
      keyParts = ['alt=', 'img'];  // Alt attribute
    } else if (challengeId === 4) {
      keyParts = ['min-height:', '.box'];  // Min-height instead of height
    }
    
    isCorrect = keyParts.length === 0 || keyParts.every(part => normalizedUser.indexOf(part.replace(/\s+/g, ' ')) !== -1);
  }
  
  if (isCorrect) {
    statusDiv.innerHTML = '<div style="margin-top: 15px; padding: 15px; background: rgba(46, 204, 113, 0.2); border-left: 3px solid #2ecc71; color: #000000; border-radius: 4px; font-weight: bold;">✅ CORRECT! Great debugging! Moving to next challenge...</div>';
    setTimeout(function() {
      completeDebugChallenge(challengeId);
    }, 2000);
  } else {
    statusDiv.innerHTML = '<div style="margin-top: 15px; padding: 15px; background: rgba(231, 76, 60, 0.2); border-left: 3px solid #e74c3c; color: #000000; border-radius: 4px; font-weight: bold;">❌ Not quite right. Review the bugs list and hint above. Try again or click SHOW ANSWER for help.</div>';
  }
}

function showDebugAnswer(challengeId) {
  var challenge = debugChallenges.find(c => c.id === challengeId);
  if (!challenge) return;
  
  document.getElementById('debug-fix-' + challengeId).value = challenge.expectedFix;
  var statusDiv = document.getElementById('debug-status-' + challengeId);
  statusDiv.innerHTML = '<div style="margin-top: 15px; padding: 20px; background: rgba(46, 204, 113, 0.15); border: 2px solid #2ecc71; border-radius: 4px;"><p style="margin: 0 0 12px 0; color: #000000; font-weight: bold; font-size: 16px;">✅ CORRECT FIX SHOWN ABOVE</p><p style="margin: 0; color: #000000; font-size: 14px;">Review the corrected code in the editor and click CHECK FIX to confirm.</p></div>';
}

function completeDebugChallenge(challengeId) {
  debugCompletedChallenges[challengeId] = true;
  
  setTimeout(function() {
    if (challengeId < 4) {
      alert('🎉 Challenge ' + challengeId + ' fixed! Next challenge unlocked.');
    }
    renderDebugChallenges();
  }, 500);
}

function skipDebugChallenge(challengeId) {
  if (confirm('Skip this challenge? You won\'t get the points.')) {
    debugCompletedChallenges[challengeId] = true;
    
    setTimeout(function() {
      renderDebugChallenges();
    }, 300);
  }
}

function completeAllDebugChallenges() {
  var allComplete = true;
  
  for (var i = 0; i < debugChallenges.length; i++) {
    if (!debugCompletedChallenges[debugChallenges[i].id]) {
      allComplete = false;
      break;
    }
  }

  if (allComplete) {
    setTimeout(function() {
      showDebugResults(100);
    }, 500);
  } else {
    alert('⚠️ Complete all 4 debugging challenges first!');
  }
}

function showDebugResults(percentage) {
  document.getElementById('debug-challenges-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'block';

  document.getElementById('result-title').textContent = '🎓 Level Complete!';
  document.getElementById('result-message').textContent = 'You mastered debugging!';
  document.getElementById('final-score').textContent = percentage + '%';

  var feedback = 'Congratulations! You\'ve completed UxPlore Buster! You\'re now a UX/UI design expert!';
  document.getElementById('result-feedback').textContent = feedback;

  StorageManager.completeLevelQuiz('level5', percentage);
}
