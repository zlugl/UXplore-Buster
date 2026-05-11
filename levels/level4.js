// Level 4: Design Through Code - 10 Interactive Coding Challenges
// External JavaScript file with timer and result feedback

checkAuth();

// Challenge definitions with validation and feedback (10 challenges)
var challenges = [
  {
    id: 1,
    title: "🔘 Challenge 1: Your First Button",
    description: "Create a simple button with any style you like!",
    startCode: "<button>Click Me</button>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasButton = lowerHtml.indexOf('<button') >= 0;
      return {
        passed: hasButton,
        feedback: hasButton 
          ? "✅ Great! You created a button element." 
          : "❌ Missing &lt;button&gt; tag. Try: &lt;button&gt;Click Me&lt;/button&gt;"
      };
    },
    points: 10,
    explanation: "Buttons are created with the &lt;button&gt; tag. They're essential for user interactions like submitting forms or triggering actions."
  },
  {
    id: 2,
    title: "🎨 Challenge 2: Simple Card",
    description: "Create a card with a title and description inside a div",
    startCode: "<div class=\"card\">\n  <h3>My Card</h3>\n  <p>This is a card</p>\n</div>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasDiv = lowerHtml.indexOf('<div') >= 0;
      var hasHeading = lowerHtml.indexOf('<h') >= 0;
      var hasParagraph = lowerHtml.indexOf('<p') >= 0;
      var passed = hasDiv && hasHeading && hasParagraph;
      return {
        passed: passed,
        feedback: passed
          ? "✅ Perfect! Card structure with heading and paragraph."
          : "❌ Need all three: &lt;div&gt; container, &lt;h1-h6&gt; heading, and &lt;p&gt; paragraph."
      };
    },
    points: 10,
    explanation: "Cards organize content. Use &lt;div&gt; as container, headings (&lt;h1&gt;-&lt;h6&gt;) for titles, and &lt;p&gt; for body text."
  },
  {
    id: 3,
    title: "📝 Challenge 3: Login Form",
    description: "Create a form with input fields for username/email and password",
    startCode: "<form>\n  <input type=\"text\" placeholder=\"Username\">\n  <input type=\"password\" placeholder=\"Password\">\n  <button>Login</button>\n</form>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasForm = lowerHtml.indexOf('<form') >= 0 || lowerHtml.indexOf('<input') >= 0;
      var hasInputs = (lowerHtml.match(/<input/g) || []).length >= 2;
      var passed = hasForm && hasInputs;
      return {
        passed: passed,
        feedback: passed
          ? "✅ Excellent! Form with multiple input fields created."
          : "❌ Need a &lt;form&gt; with at least 2 &lt;input&gt; fields (e.g., text and password)."
      };
    },
    points: 10,
    explanation: "Forms collect user data. Use &lt;input type=\"text\"&gt; for usernames and &lt;input type=\"password\"&gt; for secure fields."
  },
  {
    id: 4,
    title: "📦 Challenge 4: Two Boxes Side by Side",
    description: "Create two boxes next to each other (use flexbox or grid)",
    startCode: "<div class=\"container\">\n  <div class=\"box\">Box 1</div>\n  <div class=\"box\">Box 2</div>\n</div>\n\n<style>\n  .container {\n    display: flex;\n  }\n</style>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasContainer = lowerHtml.indexOf('container') >= 0;
      var hasMultipleBoxes = (lowerHtml.match(/<div/g) || []).length >= 2;
      var hasDisplay = lowerHtml.indexOf('display') >= 0;
      var passed = hasContainer && hasMultipleBoxes && hasDisplay;
      return {
        passed: passed,
        feedback: passed
          ? "✅ Awesome! Layout with flexbox/grid created."
          : "❌ Need container div, multiple child divs, and CSS 'display: flex' or 'display: grid'."
      };
    },
    points: 10,
    explanation: "Flexbox (display: flex) and Grid (display: grid) are CSS layout systems that arrange elements in rows/columns."
  },
  {
    id: 5,
    title: "🎨 Challenge 5: Styled Button",
    description: "Add CSS to style your button with color, padding, and rounded corners",
    startCode: "<button class=\"my-btn\">Styled Button</button>\n<style>\n  .my-btn {\n    background: #00d9ff;\n    padding: 10px 20px;\n    border-radius: 5px;\n  }\n</style>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasButton = lowerHtml.indexOf('<button') >= 0;
      var hasStyle = lowerHtml.indexOf('<style') >= 0 || lowerHtml.indexOf('style=') >= 0;
      var hasBackground = lowerHtml.indexOf('background') >= 0 || lowerHtml.indexOf('color') >= 0;
      var hasPadding = lowerHtml.indexOf('padding') >= 0;
      var passed = hasButton && hasStyle && (hasBackground || hasPadding);
      return {
        passed: passed,
        feedback: passed
          ? "✅ Beautiful! Button styled with CSS properties."
          : "❌ Add &lt;style&gt; tag with background-color, padding, or border-radius to your button."
      };
    },
    points: 10,
    explanation: "CSS properties like background-color, padding, and border-radius make buttons visually appealing and user-friendly."
  },
  {
    id: 6,
    title: "🧭 Challenge 6: Navigation Menu",
    description: "Create a navigation menu using an unordered list with links",
    startCode: "<nav>\n  <ul>\n    <li><a href=\"#home\">Home</a></li>\n    <li><a href=\"#about\">About</a></li>\n    <li><a href=\"#contact\">Contact</a></li>\n  </ul>\n</nav>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasNav = lowerHtml.indexOf('<nav') >= 0 || lowerHtml.indexOf('<ul') >= 0;
      var hasList = lowerHtml.indexOf('<ul') >= 0 && lowerHtml.indexOf('</ul>') >= 0;
      var hasLinks = (lowerHtml.match(/<a\s+href/g) || []).length >= 2;
      var passed = hasNav && hasList && hasLinks;
      return {
        passed: passed,
        feedback: passed
          ? "✅ Perfect! Navigation menu with list and links created."
          : "❌ Need &lt;ul&gt; list, &lt;li&gt; items, and &lt;a href=\"...\"&gt; links inside a &lt;nav&gt; or container."
      };
    },
    points: 10,
    explanation: "Navigation menus use &lt;ul&gt; for structure, &lt;li&gt; for items, and &lt;a&gt; tags with href for clickable links."
  },
  {
    id: 7,
    title: "🖼️ Challenge 7: Image with Caption",
    description: "Add an image with a caption using figure and figcaption",
    startCode: "<figure>\n  <img src=\"https://via.placeholder.com/150\" alt=\"Sample image\">\n  <figcaption>A sample image caption</figcaption>\n</figure>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasFigure = lowerHtml.indexOf('<figure') >= 0;
      var hasImg = lowerHtml.indexOf('<img') >= 0;
      var hasFigcaption = lowerHtml.indexOf('<figcaption') >= 0;
      var hasAlt = lowerHtml.indexOf('alt=') >= 0;
      var passed = hasFigure && hasImg && hasFigcaption && hasAlt;
      return {
        passed: passed,
        feedback: passed
          ? "✅ Great! Image with semantic caption and alt text."
          : "❌ Use &lt;figure&gt;, &lt;img alt=\"...\"&gt;, and &lt;figcaption&gt; for accessible images."
      };
    },
    points: 10,
    explanation: "The &lt;figure&gt; element groups media with &lt;figcaption&gt; for captions. Always include alt text for accessibility."
  },
  {
    id: 8,
    title: "⚡ Challenge 8: Hover Effects",
    description: "Add a CSS hover effect to change button color on mouseover",
    startCode: "<button class=\"hover-btn\">Hover Me</button>\n<style>\n  .hover-btn {\n    background: #00d9ff;\n    transition: 0.3s;\n  }\n  .hover-btn:hover {\n    background: #00a3cc;\n  }\n</style>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasButton = lowerHtml.indexOf('<button') >= 0;
      var hasHover = lowerHtml.indexOf(':hover') >= 0;
      var hasTransition = lowerHtml.indexOf('transition') >= 0 || lowerHtml.indexOf('background') >= 0;
      var passed = hasButton && hasHover && hasTransition;
      return {
        passed: passed,
        feedback: passed
          ? "✅ Smooth! Hover effect with CSS :hover pseudo-class."
          : "❌ Add :hover pseudo-class in CSS to change styles on mouseover."
      };
    },
    points: 10,
    explanation: "The :hover pseudo-class applies styles when users mouse over elements. Use transition for smooth animations."
  },
  {
    id: 9,
    title: "📱 Challenge 9: Responsive Grid",
    description: "Create a 3-column grid that stacks on small screens",
    startCode: "<div class=\"grid-container\">\n  <div class=\"grid-item\">Item 1</div>\n  <div class=\"grid-item\">Item 2</div>\n  <div class=\"grid-item\">Item 3</div>\n</div>\n<style>\n  .grid-container {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 10px;\n  }\n  @media (max-width: 600px) {\n    .grid-container {\n      grid-template-columns: 1fr;\n    }\n  }\n</style>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasGrid = lowerHtml.indexOf('display: grid') >= 0 || lowerHtml.indexOf('display:grid') >= 0;
      var hasTemplate = lowerHtml.indexOf('grid-template-columns') >= 0;
      var hasMedia = lowerHtml.indexOf('@media') >= 0;
      var hasItems = (lowerHtml.match(/<div[^>]*class=\"grid-item\"/g) || []).length >= 2;
      var passed = hasGrid && hasTemplate && hasMedia && hasItems;
      return {
        passed: passed,
        feedback: passed
          ? "✅ Responsive! Grid layout with media query for mobile."
          : "❌ Need display: grid, grid-template-columns, and @media query for responsiveness."
      };
    },
    points: 10,
    explanation: "CSS Grid creates flexible layouts. @media queries adapt designs for different screen sizes (responsive design)."
  },
  {
    id: 10,
    title: "🏆 Challenge 10: Complete Mini Page",
    description: "Combine everything: header, nav, content card, and styled button",
    startCode: "<header><h1>My Page</h1></header>\n<nav><a href=\"#\">Home</a> | <a href=\"#\">About</a></nav>\n<main>\n  <div class=\"card\">\n    <h2>Welcome!</h2>\n    <p>This is my mini page.</p>\n    <button class=\"btn\">Learn More</button>\n  </div>\n</main>\n<style>\n  .card { padding: 20px; border: 1px solid #ccc; border-radius: 8px; }\n  .btn { background: #00d9ff; padding: 10px 20px; border: none; border-radius: 5px; }\n</style>",
    validate: function(html) {
      var lowerHtml = html.toLowerCase();
      var hasHeader = lowerHtml.indexOf('<header') >= 0 || lowerHtml.indexOf('<h1') >= 0;
      var hasNav = lowerHtml.indexOf('<nav') >= 0 || lowerHtml.indexOf('<a href') >= 0;
      var hasMain = lowerHtml.indexOf('<main') >= 0 || lowerHtml.indexOf('<div class=\"card\"') >= 0;
      var hasButton = lowerHtml.indexOf('<button') >= 0;
      var hasStyle = lowerHtml.indexOf('<style') >= 0;
      var passed = hasHeader && hasNav && hasMain && hasButton && hasStyle;
      return {
        passed: passed,
        feedback: passed
          ? "🎉 Amazing! Complete mini page with structure, navigation, content, and styling."
          : "❌ Combine header, nav, main content area, button, and CSS styling for a complete page."
      };
    },
    points: 10,
    explanation: "Real web pages combine semantic HTML (header, nav, main) with CSS styling for structure, navigation, content, and interactivity."
  }
];

// State management
var completedChallenges = {};
var challengeResults = {};
var currentChallengeId = null;
var timerInterval = null;
var timeRemaining = 120; // 2 minutes per challenge
var challengeStartTime = null;

// Timer functions
function startTimer() {
  timeRemaining = 120;
  updateTimerDisplay();
  
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(function() {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 10) {
      document.getElementById('timer-display').classList.add('timer-warning');
    }
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      // Auto-check current challenge if time runs out
      if (currentChallengeId && !completedChallenges[currentChallengeId]) {
        validateChallenge(currentChallengeId, true); // true = timed out
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  var display = document.getElementById('timer-display');
  display.textContent = timeRemaining + 's';
  if (timeRemaining <= 10) {
    display.classList.add('timer-warning');
  } else {
    display.classList.remove('timer-warning');
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  document.getElementById('timer-display').classList.remove('timer-warning');
}

// Main functions
function startChallenges() {
  document.getElementById('lecture-section').style.display = 'none';
  document.getElementById('challenge-section').style.display = 'block';
  renderChallenges();
  startTimer();
}

function renderChallenges() {
  var container = document.getElementById('challenges-container');
  container.innerHTML = '';

  // Find the first incomplete challenge
  var currentChallenge = null;
  for (var i = 0; i < challenges.length; i++) {
    if (!completedChallenges[challenges[i].id]) {
      currentChallenge = challenges[i];
      break;
    }
  }

  // If all challenges completed
  if (!currentChallenge) {
    container.innerHTML = '<p style="text-align: center; color: var(--success); padding: 40px; font-size: 20px;">🎉 ALL 10 CHALLENGES COMPLETED!</p>';
    stopTimer();
    return;
  }

  currentChallengeId = currentChallenge.id;
  challengeStartTime = Date.now();

  var challengeDiv = document.createElement('div');
  challengeDiv.className = 'challenge-card';
  challengeDiv.id = 'challenge-' + currentChallenge.id;
  
  var html = '<h3>' + currentChallenge.title + '</h3>';
  html += '<p style="color: var(--text-secondary); margin-bottom: 15px;">' + currentChallenge.description + '</p>';
  html += '<p style="color: var(--accent-cyan); font-weight: bold; margin-bottom: 20px;">Challenge ' + currentChallenge.id + ' of 10</p>';
  
  html += '<div class="code-editor-container">';
  html += '<div class="code-panel"><div class="panel-header">Code Editor</div>';
  html += '<textarea class="code-input" id="code-' + currentChallenge.id + '" placeholder="Write code..."></textarea></div>';
  html += '<div class="preview-panel"><div class="panel-header">Live Preview</div>';
  html += '<iframe id="preview-' + currentChallenge.id + '" class="preview-frame"></iframe></div></div>';
  
  html += '<div style="display: flex; gap: 10px; margin-top: 15px;">';
  html += '<button class="btn btn-secondary" onclick="updatePreview(' + currentChallenge.id + ')" style="flex: 1;">UPDATE</button>';
  html += '<button class="btn btn-primary" onclick="validateChallenge(' + currentChallenge.id + ')" style="flex: 1;">CHECK</button></div>';
  html += '<div id="status-' + currentChallenge.id + '"></div>';
  
  challengeDiv.innerHTML = html;
  container.appendChild(challengeDiv);
  
  var textarea = document.getElementById('code-' + currentChallenge.id);
  textarea.value = currentChallenge.startCode;
  
  textarea.addEventListener('input', function() {
    updatePreview(currentChallenge.id);
  });
  
  updatePreview(currentChallenge.id);
}

function updatePreview(challengeId) {
  var code = document.getElementById('code-' + challengeId).value;
  var iframe = document.getElementById('preview-' + challengeId);
  
  try {
    var doc = iframe.contentDocument;
    doc.open();
    doc.write('<!DOCTYPE html><html><head><style>body{background:white;color:#0a0e27;font-family:Arial;padding:20px;}</style></head><body>' + code + '</body></html>');
    doc.close();
  } catch (e) {
    console.error('Preview error:', e);
  }
}

function validateChallenge(challengeId, timedOut) {
  var challenge = null;
  for (var i = 0; i < challenges.length; i++) {
    if (challenges[i].id === challengeId) {
      challenge = challenges[i];
      break;
    }
  }
  
  if (!challenge) return;
  
  var codeElement = document.getElementById('code-' + challengeId);
  if (!codeElement) return;
  
  var code = codeElement.value;
  var statusDiv = document.getElementById('status-' + challengeId);
  var timeSpent = Math.round((Date.now() - challengeStartTime) / 1000);

  // Store result for final breakdown
  var validation = challenge.validate(code);
  challengeResults[challengeId] = {
    passed: validation.passed || timedOut,
    timeSpent: timeSpent,
    userCode: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
    feedback: validation.feedback,
    explanation: challenge.explanation
  };

  if (validation.passed && !timedOut) {
    completedChallenges[challengeId] = true;
    statusDiv.innerHTML = '<div class="code-feedback correct">' + validation.feedback + '</div>';
    codeElement.disabled = true;
    
    // Show success message
    var nextNum = challengeId + 1;
    var nextMsg = nextNum <= 10 ? '\n\nChallenge ' + nextNum + ' is now unlocked!' : '\n\n🎉 All challenges complete!';
    alert('🎉 Great job! Challenge ' + challengeId + ' completed!\n\n⏱️ Time: ' + timeSpent + 's' + nextMsg);
    
    // Re-render to show next challenge
    setTimeout(function() {
      renderChallenges();
      if (currentChallengeId && !completedChallenges[currentChallengeId]) startTimer();
    }, 500);
    
  } else {
    var message = timedOut 
      ? '⏰ Time\'s up! ' + validation.feedback 
      : validation.feedback;
    statusDiv.innerHTML = '<div class="code-feedback incorrect">' + message + '</div>';
    
    // Show hint
    alert('💡 Hint: ' + challenge.explanation + '\n\nKeep trying!');
  }
}

function checkAllChallenges() {
  stopTimer();
  
  var allComplete = true;
  for (var i = 0; i < challenges.length; i++) {
    if (!completedChallenges[challenges[i].id]) {
      allComplete = false;
      break;
    }
  }

  if (allComplete) {
    showResults(100);
  } else {
    alert('⚠️ Complete all 10 challenges first!');
    // Restart timer if user wants to continue
    if (currentChallengeId && !completedChallenges[currentChallengeId]) startTimer();
  }
}

function showResults(percentage) {
  document.getElementById('challenge-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'block';

  document.getElementById('result-title').textContent = 'Level Complete!';
  document.getElementById('result-message').textContent = 'You mastered HTML and CSS fundamentals!';
  document.getElementById('final-score').textContent = percentage + '%';
  document.getElementById('result-feedback').textContent = 'Excellent! Level 5 is now unlocked. Keep building!';

  // Generate detailed breakdown
  var breakdownContainer = document.getElementById('result-breakdown');
  breakdownContainer.innerHTML = '<h4 style="margin-bottom: 15px; color: var(--accent-cyan);">📋 Challenge Results (10 Total)</h4>';
  
  challenges.forEach(function(challenge) {
    var result = challengeResults[challenge.id];
    if (result) {
      var resultItem = document.createElement('div');
      resultItem.className = 'result-item ' + (result.passed ? 'correct' : 'incorrect');
      
      resultItem.innerHTML = 
        '<div class="result-question">' + challenge.title + 
        ' <span class="result-status ' + (result.passed ? 'correct' : 'incorrect') + '">' + 
        (result.passed ? '✓ Passed' : '✗ Failed') + '</span></div>' +
        '<div class="result-answer"><strong>⏱️ Time:</strong> ' + result.timeSpent + 's</div>' +
        '<div class="result-answer"><strong>💬 Feedback:</strong> ' + result.feedback + '</div>' +
        '<div class="result-answer" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.2);">' +
        '<strong>📚 Learn:</strong> ' + result.explanation + '</div>';
      
      breakdownContainer.appendChild(resultItem);
    }
  });

  // Complete the level
  StorageManager.completeLevelQuiz('level4', percentage);
}