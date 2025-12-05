/**
 * Orders API Service
 * Endpoints for order management
 */

import { apiGet } from './config';

/**
 * Get orders based on user role
 * - Admin: Get all orders
 * - Staff: Get orders for assigned clients only
 * @returns {Promise<Array>} Array of Order objects
 */
export async function getOrders() {
    return apiGet('/orders');
}

/**
 * Get orders for a specific user/client
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of orders for this user
 */
export async function getUserOrders(userId) {
    return apiGet(`/users/${userId}/orders`);
}