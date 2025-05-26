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

// Random character animations
function randomCharacterAnimation() {
    const availableCharacters = characters.filter(character => 
        !character.className.includes('happy') && 
        !character.className.includes('peek') && 
        !character.className.includes('surprised')
    );
    
    if (availableCharacters.length > 0) {
        const randomCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
        const animations = ["peek", "surprised"];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        
        randomCharacter.className = randomCharacter.className.replace(/\s(happy|peek|surprised)/g, '') + ` ${randomAnimation}`;
        
        setTimeout(() => {
            randomCharacter.className = randomCharacter.className.replace(/\s(happy|peek|surprised)/g, '');
        }, 1500);
    }
}

// Start random animations
setInterval(randomCharacterAnimation, 4000);

// Remember me functionality (basic example)
const rememberMeCheckbox = document.getElementById("remember-me");
if (rememberMeCheckbox) {
    rememberMeCheckbox.addEventListener("change", function() {
        if (this.checked) {
            // Characters react positively to remember me
            const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
            randomCharacter.className = randomCharacter.className.replace(/\s(happy|peek|surprised)/g, '') + " happy";
            setTimeout(() => {
                randomCharacter.className = randomCharacter.className.replace(/\s(happy|peek|surprised)/g, '');
            }, 1500);
        }
    });
}

// Eye follow functionality
document.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    characters.forEach(character => {
        // Find all eye elements inside the character
        const eyes = character.querySelectorAll('.eye');
        eyes.forEach(eye => {
            // Get the position of the eye in the viewport
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            // Calculate the angle and distance from the eye to the mouse
            const dx = mouseX - eyeCenterX;
            const dy = mouseY - eyeCenterY;
            const angle = Math.atan2(dy, dx);

            // Limit the movement radius of the pupil
            const radius = 8; // px, adjust as needed
            const pupilX = Math.cos(angle) * radius;
            const pupilY = Math.sin(angle) * radius;

            // Move the pupil inside the eye
            const pupil = eye.querySelector('.pupil');
            if (pupil) {
                pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
            }
        });
    });
});

