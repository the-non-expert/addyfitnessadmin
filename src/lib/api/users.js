/**
 * Users API Service
 * Endpoints for user profile management
 */

import { apiGet, apiPut } from './config';

/**
 * Get current user's profile
 * @returns {Promise<Object>} Current user's User object
 */
export async function getMe() {
    return apiGet('/users/me');
}

/**
 * Update current user's profile
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated User object
 */
export async function updateMe(updates) {
    return apiPut('/users/me', updates);
}

/**
 * Get a specific user's profile by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object (filtered by permissions)
 */
export async function getUserById(userId) {
    return apiGet(`/users/${userId}`);
}

/**
 * Update a specific user's profile (admin/assigned staff only)
 * @param {number} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated User object
 */
export async function updateUser(userId, updates) {
    return apiPut(`/users/${userId}`, updates);
}

/**
 * Get all users with a specific role (admin only)
 * @param {string} role - User role to filter by ('admin', 'doctor', 'trainer', 'member')
 * @returns {Promise<Array>} Array of users with the specified role
 */
export async function getUsersByRole(role) {
    return apiGet(`/users?role=${role}`);
}

/**
 * Get all members (patients/clients) - admin only
 * Shorthand for getUsersByRole('member')
 * @returns {Promise<Array>} Array of all member users
 */
export async function getAllMembers() {
    return getUsersByRole('member');
}
