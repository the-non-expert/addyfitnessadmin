/**
 * Nutrition API Service
 * Endpoints for nutritionist-related operations
 */

import { apiGet } from './config';

/**
 * Get all clients assigned to the current nutritionist
 * @returns {Promise<Array>} Array of client User objects
 */
export async function getMyClients() {
    return apiGet('/nutrition/my-patients');
}

/**
 * Get nutrition profile of a specific client
 * @param {number} clientId - Client user ID
 * @returns {Promise<Object>} Client nutrition profile
 */
export async function getClientProfile(clientId) {
    return apiGet(`/nutrition/patient/${clientId}/profile`);
}
