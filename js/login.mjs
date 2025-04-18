// login.mjs - Module for handling login form
import { AccountManager } from './account.mjs';

class LoginHandler {
    constructor() {
        this.accountManager = null;
        this.initialized = false;
    }

    async init() {
        console.log("Initializing LoginHandler");

        // Create account manager instance
        this.accountManager = new AccountManager();
        await this.accountManager.init();

        // Set up form event listeners
        this.setupLoginForm();

        this.initialized = true;
        console.log("LoginHandler initialized");
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) {
            console.error("Login form not found");
            return;
        }

        console.log("Setting up login form");

        // Add event listener to form
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent page reload
            console.log("Login form submitted");

            // Get form values
            const username = document.getElementById('username')?.value || '';
            const password = document.getElementById('password')?.value || '';

            if (!username || !password) {
                alert("Please enter both username and password");
                return;
            }

            try {
                // Attempt login
                const result = await this.accountManager.login(username, password);

                if (result.success) {
                    console.log("Login successful, redirecting to account page");
                    // Redirect to account page
                    this.accountManager.redirectToAccountPage();
                } else {
                    // Show error message
                    alert(result.message || "Login failed. Please check your credentials.");
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("An error occurred during login. Please try again.");
            }
        });

        console.log("Login form event listener added");
    }
}

// Create and initialize handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, creating LoginHandler");
    const loginHandler = new LoginHandler();
    loginHandler.init()
        .catch(error => console.error("Error initializing LoginHandler:", error));
});



export default LoginHandler;