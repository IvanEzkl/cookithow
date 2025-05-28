/* Original JavaScript with fixes for character animation */
let animationPhase = 'initial';
let typingInterval = null;
let isTyping = false;
let currentTextIndex = 0;
let canClick = false;
let characterAnimationComplete = false;
const textsToType = ['Welcome', 'HowITCooks'];

/* FIXED CHARACTER ANIMATION FUNCTIONS */
function startCharacterSequence() {
    const character = document.getElementById('character');
    
    // Ensure character is visible and positioned correctly
    character.style.opacity = '1';
    character.style.left = '10%';
    character.style.top = '-150px';
    
    // Start falling animation
    character.classList.add('falling');
    
    // After falling completes, trigger impact
    setTimeout(() => {
        character.classList.remove('falling');
        character.classList.add('impact');
        
        // After impact, start getting up
        setTimeout(() => {
            character.classList.remove('impact');
            character.classList.add('getting-up');
            
            // After getting up completes, start idle and begin typing
            setTimeout(() => {
                character.classList.remove('getting-up');
                character.classList.add('standing');
                characterAnimationComplete = true;
                
                // Start the text animation sequence
                startTextSequence();
            }, 1500); // Duration of getting-up animation
        }, 500); // Duration of impact animation
    }, 2000); // Duration of falling animation
}

function startTextSequence() {
    const textElement = document.getElementById('animatedText');
    
    // Start the fade-in animation
    textElement.classList.add('fade-in');
    
    // Start typing sequence
    setTimeout(() => {
        typeAndSlideText(textsToType[currentTextIndex], false);
    }, 500);
}

function typeAndSlideText(text, isLastText = false) {
    const textElement = document.getElementById('animatedText');
    let index = 0;
    
    // Clear any existing content
    textElement.textContent = '';
    isTyping = true;
    textElement.classList.add('typing');
    
    // Clear any existing interval
    if (typingInterval) {
        clearInterval(typingInterval);
    }
    
    typingInterval = setInterval(() => {
        if (index < text.length) {
            textElement.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(typingInterval);
            isTyping = false;
            
            if (isLastText) {
                // Remove typing cursor after final text
                textElement.classList.remove('typing');
                
                // Wait a moment after typing completes, then trigger expand
                setTimeout(() => {
                    if (animationPhase === 'initial') {
                        triggerExpandAnimation();
                    }
                }, 1000);
            } else {
                // Wait before transitioning to next text
                setTimeout(() => {
                    eraseAndTypeNext();
                }, 1500); // Pause between texts
            }
        }
    }, 100); // Typing speed - adjust as needed
}

function eraseAndTypeNext() {
    const textElement = document.getElementById('animatedText');
    const currentText = textElement.textContent;
    let index = currentText.length;
    
    // Erase current text
    const eraseInterval = setInterval(() => {
        if (index > 0) {
            textElement.textContent = currentText.substring(0, index - 1);
            index--;
        } else {
            clearInterval(eraseInterval);
            
            // Move to next text
            currentTextIndex++;
            if (currentTextIndex < textsToType.length) {
                const isLast = currentTextIndex === textsToType.length - 1;
                setTimeout(() => {
                    typeAndSlideText(textsToType[currentTextIndex], isLast);
                }, 300); // Brief pause before typing next text
            }
        }
    }, 50); // Erase speed - faster than typing
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const textElement = document.getElementById('animatedText');
    const rect = textElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create 20 particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random direction for particle movement
        const angle = (Math.PI * 2 * i) / 20;
        const distance = 400 + Math.random() * 600;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');
        
        particlesContainer.appendChild(particle);
        
        // Activate particle with slight delay
        setTimeout(() => {
            particle.classList.add('active');
        }, i * 50);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 4000);
    }
}

function triggerExpandAnimation() {
    const textElement = document.getElementById('animatedText');
    textElement.classList.add('expand-out');
    createParticles();
    animationPhase = 'expanded';
    
    // Show click prompt after expansion completes
    setTimeout(() => {
        showClickPrompt();
    }, 1500); // Reduced from 3000ms to match faster animation
}

function showClickPrompt() {
    const clickPrompt = document.getElementById('clickPrompt');
    clickPrompt.style.opacity = '1';
    clickPrompt.style.animationDelay = '0s';
    canClick = true;
    
    // Change cursor to pointer
    document.body.style.cursor = 'pointer';
}

/* MODIFIED FUNCTION - Now shows loading animation */
function transitionToNextPage() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const pageTransition = document.getElementById('pageTransition');
    
    // Show loading animation
    loadingOverlay.classList.add('active');
    
    // Hide loading and navigate after 2 seconds
    setTimeout(() => {
        // Replace with your actual HTML file name or path
        window.location.href = '/html/index.html';
    }, 2000); // 2 second loading duration - customize this value
    
}

function resetAndRestartAnimation() {
    const particlesContainer = document.getElementById('particles');
    const textElement = document.getElementById('animatedText');
    const clickPrompt = document.getElementById('clickPrompt');
    const character = document.getElementById('character');

    // Clear particles
    particlesContainer.innerHTML = '';

    // Stop any ongoing typing
    if (typingInterval) {
        clearInterval(typingInterval);
    }

    // Reset text animation and index
    textElement.classList.remove('expand-out', 'fade-in', 'typing');
    textElement.textContent = '';
    currentTextIndex = 0; // Reset to start from "Welcome"
    
    // Hide click prompt and reset click state
    clickPrompt.style.opacity = '0';
    clickPrompt.style.animationDelay = '6s';
    canClick = false;
    document.body.style.cursor = 'default';

    // Reset character animation
    character.classList.remove('falling', 'impact', 'getting-up', 'standing');
    character.style.left = '10%';
    character.style.top = '-150px';
    character.style.opacity = '1';

    // Force reflow
    void textElement.offsetHeight;

    // Restart animation with character sequence
    animationPhase = 'initial';
    characterAnimationComplete = false;
    
    // Start character animation again
    setTimeout(() => {
        startCharacterSequence();
    }, 100);
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Start with character animation instead of text
    startCharacterSequence();
});

// Handle click anywhere on page
document.addEventListener('click', function(e) {
    // Skip if clicking during typing phase or if click is not enabled
    if (!canClick) return;
    
    // Trigger page transition
    transitionToNextPage();
});