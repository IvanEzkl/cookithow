// Form switching functionality
document.getElementById("show-signup-form").addEventListener("click", function(){
    document.getElementsByClassName("form")[0].classList.add("active");
    // All characters react to signup
    const characters = [
        document.getElementById("character"),
        document.getElementById("character2"),
        document.getElementById("character3"),
        document.getElementById("character4")
    ];
    
    characters.forEach((character, index) => {
        setTimeout(() => {
            character.className = character.className.replace(/\s(happy|peek|surprised)/g, '') + " happy";
            setTimeout(() => {
                character.className = character.className.replace(/\s(happy|peek|surprised)/g, '');
            }, 2000);
        }, index * 200);
    });
});

document.getElementById("show-signin-form").addEventListener("click", function(){
    document.getElementsByClassName("form")[0].classList.remove("active");
    // Characters react to signin
    const characters = [
        document.getElementById("character"),
        document.getElementById("character2"),
        document.getElementById("character3"),
        document.getElementById("character4")
    ];
    
    characters.forEach((character, index) => {
        setTimeout(() => {
            character.className = character.className.replace(/\s(happy|peek|surprised)/g, '') + " peek";
            setTimeout(() => {
                character.className = character.className.replace(/\s(happy|peek|surprised)/g, '');
            }, 2000);
        }, index * 150);
    });
});

// Password visibility toggle functionality
function setupPasswordToggle(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const passwordToggle = document.getElementById(toggleId);
    
    if (passwordInput && passwordToggle) {
        passwordToggle.addEventListener("click", function() {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                passwordToggle.classList.remove("fa-eye");
                passwordToggle.classList.add("fa-eye-slash");
            } else {
                passwordInput.type = "password";
                passwordToggle.classList.remove("fa-eye-slash");
                passwordToggle.classList.add("fa-eye");
            }
        });
    }
}

// Setup password toggles for both forms
setupPasswordToggle("password-input", "password-toggle");
setupPasswordToggle("signup-password-input", "signup-password-toggle");

// Character interactions
const characters = [
    document.getElementById("character"),
    document.getElementById("character2"),
    document.getElementById("character3"),
    document.getElementById("character4")
];

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");

// Character watches when typing in email
if (emailInput) {
    emailInput.addEventListener("focus", () => {
        characters.forEach((character, index) => {
            setTimeout(() => {
                if (character) {
                    character.className = character.className.replace(/\s(happy|peek|surprised)/g, '') + " peek";
                }
            }, index * 100);
        });
    });
    
    emailInput.addEventListener("blur", () => {
        setTimeout(() => {
            characters.forEach(character => {
                if (character) {
                    character.className = character.className.replace(/\s(happy|peek|surprised)/g, '');
                }
            });
        }, 500);
    });
    
    emailInput.addEventListener("input", () => {
        if (emailInput.value.length > 0) {
            const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
            if (randomCharacter) {
                randomCharacter.className = randomCharacter.className.replace(/\s(happy|peek|surprised)/g, '') + " peek";
            }
        }
    });
}

// Characters react when typing password
if (passwordInput) {
    passwordInput.addEventListener("focus", () => {
        characters.forEach((character, index) => {
            setTimeout(() => {
                if (character) {
                    character.className = character.className.replace(/\s(happy|peek|surprised)/g, '') + " surprised";
                }
            }, index * 100);
        });
    });
    
    passwordInput.addEventListener("blur", () => {
        setTimeout(() => {
            characters.forEach(character => {
                if (character) {
                    character.className = character.className.replace(/\s(happy|peek|surprised)/g, '');
                }
            });
        }, 500);
    });
    
    passwordInput.addEventListener("input", () => {
        if (passwordInput.value.length > 0) {
            characters.forEach((character, index) => {
                setTimeout(() => {
                    if (character) {
                        character.className = character.className.replace(/\s(happy|peek|surprised)/g, '') + " surprised";
                    }
                }, index * 50);
            });
        }
    });
}

// Characters celebrate on button clicks
if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;

        // Validate email
        if (!email.includes("@")) {
            alert("Please enter a valid email address.");
            return;
        }

        // Retrieve users from local storage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email);

        // Check if user exists and password matches
        if (!user) {
            alert("User  not found. Please check your email.");
            return;
        }

        if (user.password !== password) {
            alert("Incorrect password. Please try again.");
            return;
        }

        // Successful login
        alert("Login successful!");
        // Redirect to another page or perform further actions
    });
}

// Sign-up functionality
document.getElementById('signup-btn').addEventListener('click', function(e) {
    e.preventDefault();

    const password = document.getElementById('signup-password-input').value;
    const confirmPassword = document.getElementById('confirmPassword').value; // Ensure this input exists in your HTML
    
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }

    const username = document.getElementById('username').value; // Ensure this input exists in your HTML
    const email = document.getElementById('email').value; // Ensure this input exists in your HTML
    const fullName = document.getElementById('fullName').value; // Ensure this input exists in your HTML
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.username === username)) {
        alert('Username already exists. Please choose another one.');
        return;
    }

    users.push({
        username,
        password,
        email,
        fullName
    });

    localStorage.setItem('users', JSON.stringify(users));
    
    alert("Registration successful! Please login with your new account.");
    window.location.href = 'login.html';
});

window.addEventListener('DOMContentLoaded', () => {
    // Place characters just above the visible bottom of the viewport
    // and make them walk back and forth horizontally, end to end

    // Create a container for the characters at the bottom
    let bottomContainer = document.getElementById('bottom-characters-container');
    if (!bottomContainer) {
        bottomContainer = document.createElement('div');
        bottomContainer.id = 'bottom-characters-container';
        bottomContainer.style.position = 'fixed';
        bottomContainer.style.left = '0';
        bottomContainer.style.width = '100vw';
        bottomContainer.style.height = '140px';
        bottomContainer.style.pointerEvents = 'none';
        bottomContainer.style.zIndex = '1000';
        bottomContainer.style.bottom = '30px'; // 30px above the bottom edge for visibility
        document.body.appendChild(bottomContainer);
    }

    // Set up character heights and initial positions
    const characterHeights = ['80px', '100px', '120px', '90px'];
    characters.forEach((character, idx) => {
        if (character) {
            character.style.position = 'absolute';
            character.style.top = '0';
            character.style.left = (idx * 120) + 'px';
            character.style.height = characterHeights[idx];
            character.style.width = 'auto';
            character.style.transform = 'translateY(0)';
            character.style.transition = 'none';
            // Move character to the bottom container
            if (character.parentElement !== bottomContainer) {
                bottomContainer.appendChild(character);
            }
        }
    });

    // Animation state
    const animStates = characters.map(() => ({
        running: true,
        speed: 120,
        direction: 1,
        x: 0,
        peek: false,
        jumping: false,
        excited: false,
        gigglePhase: 0
    }));

    // Animate characters walking back and forth, end to end of the screen
    function walkBackAndForth(character, idx) {
        if (!character || !bottomContainer) return;

        function getBounds() {
            const charWidth = character.offsetWidth || 60;
            const minX = 0;
            const maxX = window.innerWidth - charWidth;
            return { minX, maxX, charWidth };
        }

        let { minX, maxX } = getBounds();
        let state = animStates[idx];
        state.direction = idx % 2 === 0 ? 1 : -1;
        state.x = state.direction === 1 ? minX : maxX;

        let jumpStart = null;
        let jumpDuration = 600; // ms
        let jumpHeight = 60 + idx * 10;

        function animate(now) {
            ({ minX, maxX } = getBounds());

            // If peeking, slow down to 0
            if (state.peek) {
                if (state.speed > 0) {
                    state.speed -= 6; // Decelerate
                    if (state.speed < 0) state.speed = 0;
                }
            } else {
                if (state.speed < 120 + idx * 20) {
                    state.speed += 6; // Accelerate back
                    if (state.speed > 120 + idx * 20) state.speed = 120 + idx * 20;
                }
            }

            if (state.speed > 0) {
                state.x += state.direction * (state.speed / 60);
                if (state.x > maxX) {
                    state.x = maxX;
                    state.direction = -1;
                    character.style.transform = 'scaleX(-1)';
                } else if (state.x < minX) {
                    state.x = minX;
                    state.direction = 1;
                    character.style.transform = 'scaleX(1)';
                }
                character.style.left = state.x + 'px';
            }

            // Handle jump animation
            if (state.jumping) {
                if (!jumpStart) jumpStart = now;
                let t = (now - jumpStart) / jumpDuration;
                if (t > 1) {
                    t = 1;
                    state.jumping = false;
                    jumpStart = null;
                }
                // Simple parabolic jump
                let y = -jumpHeight * 4 * t * (1 - t);
                character.style.transform = (state.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)') + ` translateY(${y}px)`;
            } else {
                character.style.transform = state.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
                jumpStart = null;
            }

            // Excited giggle animation (eyes and wiggle)
            if (state.excited) {
                // Add "excited" class for eyes, and wiggle horizontally
                character.classList.add('excited');
                // Wiggle effect (reduced by 75%)
                state.gigglePhase += 0.25 + 0.05 * idx;
                const wiggle = Math.sin(state.gigglePhase) * 1.5; // 6 * 0.25 = 1.5
                character.style.left = (state.x + wiggle) + 'px';
            } else {
                character.classList.remove('excited');
                state.gigglePhase = 0;
            }

            requestAnimationFrame(animate);
        }
        character.style.transform = state.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
        requestAnimationFrame(animate);
    }

    // Start walking animation for each character
    characters.forEach((character, idx) => {
        walkBackAndForth(character, idx);
    });

    // Helper: set all characters to peek
    function setCharactersPeek(peek) {
        characters.forEach((character, idx) => {
            animStates[idx].peek = peek;
            if (peek) {
                character.className = character.className.replace(/\s(happy|peek|surprised)/g, '') + " peek";
            } else {
                character.className = character.className.replace(/\s(happy|peek|surprised)/g, '');
            }
        });
    }

    // Helper: set all characters to excited (giggling eyes)
    function setCharactersExcited(excited) {
        characters.forEach((character, idx) => {
            animStates[idx].excited = excited;
        });
    }

    // Find the login form
    const loginForm = document.querySelector('.form');

    // Listen for mouseenter/focus on the login form or its children
    if (loginForm) {
        // Mouse events
        loginForm.addEventListener('mouseenter', () => {
            setCharactersPeek(true);
            setCharactersExcited(true);
        });
        loginForm.addEventListener('mouseleave', () => {
            setCharactersPeek(false);
            setCharactersExcited(false);
        });
        // Focus events for any input inside the form
        loginForm.addEventListener('focusin', () => {
            setCharactersPeek(true);
            setCharactersExcited(true);
        });
        loginForm.addEventListener('focusout', () => {
            setCharactersPeek(false);
            setCharactersExcited(false);
        });
    }
    // Also peek/excited if mouse is over any input in the form
    const formInputs = loginForm ? loginForm.querySelectorAll('input, button, label') : [];
    formInputs.forEach(input => {
        input.addEventListener('mouseenter', () => {
            setCharactersPeek(true);
            setCharactersExcited(true);
        });
        input.addEventListener('mouseleave', () => {
            setCharactersPeek(false);
            setCharactersExcited(false);
        });
        input.addEventListener('focus', () => {
            setCharactersPeek(true);
            setCharactersExcited(true);
        });
        input.addEventListener('blur', () => {
            setCharactersPeek(false);
            setCharactersExcited(false);
        });
    });

    // Recalculate bounds on window resize
    window.addEventListener('resize', () => {
        // No need to do anything here, bounds are recalculated in animate()
    });

    // Celebrate (jump) when login button is clicked
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            characters.forEach((character, idx) => {
                animStates[idx].jumping = true;
                // Optional: add happy face
                character.className = character.className.replace(/\s(happy|peek|surprised)/g, '') + " happy";
                setTimeout(() => {
                    character.className = character.className.replace(/\s(happy|peek|surprised)/g, '');
                }, 1200);
            });
        });
    }
});
