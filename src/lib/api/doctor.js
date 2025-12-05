/**
 * Doctor API Service
 * Endpoints for doctor/healthcare-related operations
 */

import { apiGet, apiPut } from './config';

/**
 * Get all patients assigned to the current doctor
 * @returns {Promise<Array>} Array of patient User objects
 */
export async function getMyPatients() {
    return apiGet('/doctor/my-patients');
}

/**
 * Get all appointments for the current doctor's patients
 * @returns {Promise<Array>} Array of Appointment objects
 */
export async function getMyAppointments() {
    return apiGet('/doctor/my-appointments');
}

/**
 * Get full profile of a specific patient
 * @param {number} patientId - Patient user ID
 * @returns {Promise<Object>} Patient User object with medical fields
 */
export async function getPatientProfile(patientId) {
    return apiGet(`/doctor/patient/${patientId}/profile`);
}

/**
 * Update notes for a specific appointment
 * @param {number} appointmentId - Appointment ID
 * @param {string} notes - Updated notes
 * @returns {Promise<Object>} Updated Appointment object
 */
export async function updateAppointmentNotes(appointmentId, notes) {
    return apiPut(`/doctor/appointments/${appointmentId}/notes`, { notes });
}

/**
 * Get appointments for a specific patient
 * @param {number} patientId - Patient user ID
 * @param {Array} allAppointments - Array of all appointments from getMyAppointments()
 * @returns {Array} Filtered appointments for this patient
 */
export function getPatientAppointments(patientId, allAppointments) {
    return allAppointments.filter(appt => appt.user_id === patientId);
}
