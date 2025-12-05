/**
 * API Configuration
 * Centralized API settings and utilities for Addy Fitness Admin Portal
 */

export const API_CONFIG = {
    BASE_URL: ' https://api.addyfitness.com',
    TOKEN_KEY: 'addy_jwt_token',
    TOKEN_EXPIRY_KEY: 'addy_token_expiry'
};

/**
 * Get stored JWT token from localStorage
 * @returns {string|null} JWT token or null if not found/expired
 */
export function getToken() {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
    const expiry = localStorage.getItem(API_CONFIG.TOKEN_EXPIRY_KEY);

    if (!token || !expiry) return null;

    // Check if token is expired
    if (Date.now() > parseInt(expiry)) {
        clearToken();
        return null;
    }

    return token;
}

/**
 * Store JWT token in localStorage with 24-hour expiry
 * @param {string} token - JWT token from API
 */
export function setToken(token) {
    if (typeof window === 'undefined') return;

    // Token expires in 24 hours (same as backend)
    const expiry = Date.now() + (24 * 60 * 60 * 1000);

    localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(API_CONFIG.TOKEN_EXPIRY_KEY, expiry.toString());
}

/**
 * Clear stored JWT token
 */
export function clearToken() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.TOKEN_EXPIRY_KEY);
}

/**
 * Get authorization headers for API requests
 * @returns {Object} Headers object with Authorization if token exists
 */
export function getAuthHeaders() {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/users/me')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 * @throws {Error} On API error or network failure
 */
export async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = getAuthHeaders();

    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);

        // Handle specific status codes
        if (response.status === 401) {
            // Unauthorized - clear token and throw error
            clearToken();
            throw new Error('Session expired. Please login again.');
        }

        if (response.status === 403) {
            throw new Error('You do not have permission to access this resource.');
        }

        if (response.status === 404) {
            throw new Error('Resource not found.');
        }

        if (!response.ok) {
            // Try to get error message from response
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch (e) {
                // Response wasn't JSON, use default message
            }
            throw new Error(errorMessage);
        }

        // Parse JSON response
        const data = await response.json();
        return data;

    } catch (error) {
        // Re-throw with more context if it's a network error
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your connection and ensure the API server is running.');
        }
        throw error;
    }
}

/**
 * Make GET request to API
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} Response data
 */
export async function apiGet(endpoint) {
    return apiRequest(endpoint, { method: 'GET' });
}

/**
 * Make POST request to API
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
export async function apiPost(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    });
}

/**
 * Make PUT request to API
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
export async function apiPut(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
}

/**
 * Make DELETE request to API
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} Response data
 */
export async function apiDelete(endpoint) {
    return apiRequest(endpoint, { method: 'DELETE' });
}
