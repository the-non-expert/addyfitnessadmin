import { writable } from 'svelte/store';
import { setToken, clearToken, getToken } from '$lib/api/config';

export const user = writable(null);
export const expiry = writable(null);
export const isLoading = writable(false);
export const error = writable(null);

const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours (matches backend JWT expiry)

// Map passwords to test account credentials
const passwordToCredentials = {
    'godmode': {
        email: 'admin@test.com',
        password: 'TestPass123!'
    },
    'executivemode': {
        email: 'admin@test.com', // Same admin, could use different if needed
        password: 'TestPass123!'
    },
    'doctormode': {
        email: 'doctor.alice@test.com',
        password: 'TestPass123!'
    },
    'trainermode': {
        email: 'trainer.mike@test.com',
        password: 'TestPass123!'
    },
    'nutritionistmode': {
        email: 'nutritionist.sarah@test.com',
        password: 'TestPass123!'
    }
};

/**
 * Login user with password (maps to backend credentials)
 * @param {string} password - Password gate value (godmode, executivemode, etc.)
 * @returns {Promise<boolean>} Success status
 */
export const login = async (password) => {
    const credentials = passwordToCredentials[password];

    if (!credentials) {
        error.set('Invalid password');
        return false;
    }

    isLoading.set(true);
    error.set(null);

    try {
        // Call backend login API with form-urlencoded data
        const formData = new URLSearchParams();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        console.log('Attempting login with email:', credentials.email);

        const response = await fetch('https://api.addyfitness.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        console.log('Login response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Login failed:', errorData);
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();

        // Store JWT token
        setToken(data.access_token);

        // Fetch user profile to get role and details
        const userResponse = await fetch('https://api.addyfitness.com/users/me', {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const userData = await userResponse.json();

        // Calculate expiry time
        const expireAt = Date.now() + EXPIRY_MS;

        // Set user data in store
        user.set(userData);
        expiry.set(expireAt);

        // Store user data in localStorage (for session persistence)
        localStorage.setItem('addy_admin', JSON.stringify(userData));
        localStorage.setItem('addy_expiry', expireAt.toString());

        isLoading.set(false);
        return true;

    } catch (err) {
        console.error('Login error:', err);
        error.set(err.message);
        isLoading.set(false);
        logout();
        return false;
    }
};

/**
 * Logout user and clear session
 */
export const logout = () => {
    user.set(null);
    expiry.set(null);
    error.set(null);
    clearToken();
    localStorage.removeItem('addy_admin');
    localStorage.removeItem('addy_expiry');
};

/**
 * Check existing session and restore if valid
 */
export const checkSession = () => {
    const savedUser = localStorage.getItem('addy_admin');
    const savedExpiry = Number(localStorage.getItem('addy_expiry'));
    const token = getToken();

    // All three must exist and expiry must be valid
    if (savedUser && savedExpiry && token && Date.now() < savedExpiry) {
        try {
            const userData = JSON.parse(savedUser);
            user.set(userData);
            expiry.set(savedExpiry);
        } catch (e) {
            console.error('Session restore error:', e);
            logout();
        }
    } else {
        logout();
    }
};

/**
 * Get current user role
 * @returns {string|null} User role or null if not logged in
 */
export const getUserRole = () => {
    let currentUser = null;
    user.subscribe(value => currentUser = value)();
    return currentUser?.role || null;
};

/**
 * Check if user has a specific role
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean} True if user has one of the specified roles
 */
export const hasRole = (roles) => {
    const role = getUserRole();
    if (!role) return false;

    if (Array.isArray(roles)) {
        return roles.includes(role);
    }
    return role === roles;
};
