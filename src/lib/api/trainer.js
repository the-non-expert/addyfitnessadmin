/**
 * Trainer API Service
 * Endpoints for trainer/training-related operations
 */

import { apiGet } from './config';

/**
 * Get all clients assigned to the current trainer
 * @returns {Promise<Array>} Array of client User objects (fitness fields only)
 */
export async function getMyClients() {
    return apiGet('/trainer/my-clients');
}

/**
 * Get fitness profile of a specific client
 * @param {number} clientId - Client user ID
 * @returns {Promise<Object>} Client User object (medical fields excluded)
 */
export async function getClientProfile(clientId) {
    return apiGet(`/trainer/client/${clientId}/profile`);
}
