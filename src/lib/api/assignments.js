/**
 * Assignments API Service
 * Admin-only endpoints for managing staff-client assignments
 */

import { apiGet, apiPost, apiPut, apiDelete } from './config';

/**
 * Get all clients assigned to a specific staff member
 * @param {number} staffUserId - Staff member's user ID
 * @param {boolean} includeCompleted - Include completed assignments
 * @returns {Promise<Array>} Array of Assignment objects
 */
export async function getStaffClients(staffUserId, includeCompleted = false) {
    const endpoint = `/assignments/staff/${staffUserId}/clients${includeCompleted ? '?include_completed=true' : ''}`;
    return apiGet(endpoint);
}

/**
 * Get all staff members assigned to a specific client
 * @param {number} clientUserId - Client's user ID
 * @returns {Promise<Array>} Array of Assignment objects
 */
export async function getClientStaff(clientUserId) {
    return apiGet(`/assignments/client/${clientUserId}/staff`);
}

/**
 * Create a new staff-client assignment
 * @param {Object} assignmentData - Assignment data
 * @param {number} assignmentData.staff_user_id - Staff member ID (doctor/trainer)
 * @param {number} assignmentData.client_user_id - Client/patient ID
 * @param {string} assignmentData.service_type - "healthcare" | "training" | "nutrition"
 * @returns {Promise<Object>} Created Assignment object
 */
export async function createAssignment(assignmentData) {
    return apiPost('/assignments', assignmentData);
}

/**
 * Mark an assignment as completed
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} Success message
 */
export async function completeAssignment(assignmentId) {
    return apiPut(`/assignments/${assignmentId}/complete`, {});
}

/**
 * Cancel an assignment (marks as cancelled, doesn't delete)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} Success message
 */
export async function cancelAssignment(assignmentId) {
    return apiDelete(`/assignments/${assignmentId}`);
}

/**
 * Get all assignments (admin only)
 * @param {boolean} includeCompleted - Include completed assignments
 * @returns {Promise<Array>} Array of all Assignment objects
 */
export async function getAllAssignments(includeCompleted = false) {
    const endpoint = includeCompleted ? '/assignments?include_completed=true' : '/assignments';
    return apiGet(endpoint);
}
