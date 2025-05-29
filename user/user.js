// Navigation State Management
class NavbarManager {
    constructor() {
        this.isAuthenticated = false;
        this.isMenuOpen = false;
        this.isProfileDropdownOpen = false;
        
        // Mock user data - replace with actual user data from your auth system
        this.user = {
            name: "John Doe",
            email: "john@example.com",
            avatar: "/api/placeholder/40/40"
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupAvatarFallback();
    }
    
    bindEvents() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuth();
            });
        }
        
        // Profile button
        const profileButton = document.getElementById('profileButton');
        if (profileButton) {
            profileButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleProfileDropdown();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuth();
            });
        }
        
        // Menu toggle
        const menuIcon = document.getElementById('menuIcon');
        if (menuIcon) {
            menuIcon.addEventListener('click', () => {
                this.toggleMenu();
            });
        }
        
        // Demo toggle button
        const demoToggle = document.getElementById('demoToggle');
        if (demoToggle) {
            demoToggle.addEventListener('click', () => {
                this.toggleAuth();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const profileContainer = document.getElementById('profileContainer');
            const profileDropdown = document.getElementById('profileDropdown');
            
            if (profileContainer && !profileContainer.contains(e.target)) {
                this.closeProfileDropdown();
            }
        });
        
        // Close mobile menu when clicking on nav links
        const navLinks = document.querySelectorAll('.navbar a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.toggleMenu();
                }
            });
        });
    }
    
    setupAvatarFallback() {
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.addEventListener('error', (e) => {
                e.target.src = this.generateAvatarFallback();
            });
        }
    }
    
    generateAvatarFallback() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FAA307" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    toggleAuth() {
        this.isAuthenticated = !this.isAuthenticated;
        this.updateAuthUI();
        this.closeProfileDropdown();
    }
    
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.updateMenuUI();
    }
    
    toggleProfileDropdown() {
        this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
        this.updateProfileDropdownUI();
    }
    
    closeProfileDropdown() {
        this.isProfileDropdownOpen = false;
        this.updateProfileDropdownUI();
    }
    
    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const profileContainer = document.getElementById('profileContainer');
        const welcomeMessage = document.getElementById('welcomeMessage');
        const demoToggle = document.getElementById('demoToggle');
        
        if (this.isAuthenticated) {
            // Show profile, hide login
            if (loginBtn) loginBtn.style.display = 'none';
            if (profileContainer) profileContainer.style.display = 'inline-block';
            
            // Update profile info
            this.updateProfileInfo();
            
            // Update welcome message
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome back, ${this.user.name}!`;
            }
            
            // Update demo button
            if (demoToggle) {
                demoToggle.textContent = 'Logout Demo';
            }
        } else {
            // Show login, hide profile
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (profileContainer) profileContainer.style.display = 'none';
            
            // Update welcome message
            if (welcomeMessage) {
                welcomeMessage.textContent = 'Please log in to access all features';
            }
            
            // Update demo button
            if (demoToggle) {
                demoToggle.textContent = 'Login Demo';
            }
        }
    }
    
    updateProfileInfo() {
        const profileName = document.getElementById('profileName');
        const dropdownName = document.getElementById('dropdownName');
        const dropdownEmail = document.getElementById('dropdownEmail');
        const profileAvatar = document.getElementById('profileAvatar');
        
        if (profileName) {
            profileName.textContent = this.user.name.split(' ')[0];
        }
        
        if (dropdownName) {
            dropdownName.textContent = this.user.name;
        }
        
        if (dropdownEmail) {
            dropdownEmail.textContent = this.user.email;
        }
        
        if (profileAvatar) {
            profileAvatar.src = this.user.avatar;
            profileAvatar.alt = this.user.name;
        }
    }
    
    updateMenuUI() {
        const menuIcon = document.getElementById('menuIcon');
        const navbars = document.querySelectorAll('.navbar');
        
        if (menuIcon) {
            menuIcon.textContent = this.isMenuOpen ? '✕' : '☰';
        }
        
        // Toggle menu class for mobile
        navbars.forEach(navbar => {
            if (this.isMenuOpen) {
                navbar.classList.add('menu-open');
            } else {
                navbar.classList.remove('menu-open');
            }
        });
    }
    
    updateProfileDropdownUI() {
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (profileDropdown) {
            if (this.isProfileDropdownOpen) {
                profileDropdown.classList.add('open');
            } else {
                profileDropdown.classList.remove('open');
            }
        }
    }
    
    // Public methods for external integration
    setUser(userData) {
        this.user = { ...this.user, ...userData };
        if (this.isAuthenticated) {
            this.updateProfileInfo();
        }
    }
    
    login(userData = null) {
        if (userData) {
            this.setUser(userData);
        }
        this.isAuthenticated = true;
        this.updateAuthUI();
    }
    
    logout() {
        this.isAuthenticated = false;
        this.updateAuthUI();
        this.closeProfileDropdown();
    }
    
    getAuthState() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.user
        };
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global navbar instance
    window.navbarManager = new NavbarManager();
    
    // Optional: Expose methods globally for easy integration
    window.loginUser = (userData) => window.navbarManager.login(userData);
    window.logoutUser = () => window.navbarManager.logout();
    window.setUserData = (userData) => window.navbarManager.setUser(userData);
    window.getAuthState = () => window.navbarManager.getAuthState();
});

// Handle responsive behavior
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && window.navbarManager?.isMenuOpen) {
        window.navbarManager.toggleMenu();
    }
});