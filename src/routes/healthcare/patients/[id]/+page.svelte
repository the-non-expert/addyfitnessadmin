<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { Undo2, User, Mail, Phone, Activity, Calendar, FileText, Pill, AlertCircle, Ruler, Weight, Loader2, Save } from "lucide-svelte";
    import { getPatientProfile, getMyAppointments, updateAppointmentNotes } from "$lib/api/doctor";

    let patient = null;
    let appointments = [];
    let loading = true;
    let error = null;
    let savingNotes = {};

    $: patientId = parseInt($page.params.id);

    onMount(async () => {
        try {
            loading = true;
            error = null;

            const [patientData, appointmentsData] = await Promise.all([
                getPatientProfile(patientId),
                getMyAppointments()
            ]);

            patient = patientData;

            // Filter appointments for this patient
            if (Array.isArray(appointmentsData)) {
                appointments = appointmentsData.filter(appt => appt.user_id === patientId);
            } else if (appointmentsData.appointments) {
                appointments = appointmentsData.appointments.filter(appt => appt.user_id === patientId);
            }

            // Sort appointments by date (most recent first)
            appointments.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

        } catch (err) {
            console.error("Error fetching patient profile:", err);
            error = err.message || "Failed to load patient profile";
        } finally {
            loading = false;
        }
    });

    async function saveNotes(appointmentId: number, currentNotes: string) {
        const newNotes = prompt("Update appointment notes:", currentNotes || "");

        if (newNotes === null) return; // Cancelled

        try {
            savingNotes[appointmentId] = true;
            savingNotes = { ...savingNotes }; // Trigger reactivity

            const updated = await updateAppointmentNotes(appointmentId, newNotes);

            // Update local state
            appointments = appointments.map(appt =>
                appt.id === appointmentId ? { ...appt, notes: newNotes } : appt
            );

            alert("Notes updated successfully!");
        } catch (err) {
            alert("Failed to update notes: " + err.message);
        } finally {
            savingNotes[appointmentId] = false;
            savingNotes = { ...savingNotes };
        }
    }

    function formatDate(dateString: string) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
</script>

<section
    class="min-h-screen flex flex-col items-center text-white px-6 py-10"
>
    <a
        href="/healthcare/patients"
        class="text-white font-bold px-10 py-3 bg-black items-center rounded-3xl mb-8 flex gap-2 hover:bg-gray-800 transition"
    >
        <Undo2 size="20" /> <span>Back to Patients List</span>
    </a>

    <div class="w-full max-w-6xl">
        {#if loading}
            <div class="flex flex-col items-center justify-center py-20">
                <Loader2 size="48" class="animate-spin text-[#F41A53] mb-4" />
                <p class="text-gray-400">Loading patient profile...</p>
            </div>
        {:else if error}
            <div class="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-6 text-center">
                <p class="text-red-300 text-lg font-semibold mb-2">Error Loading Profile</p>
                <p class="text-red-200">{error}</p>
                <button
                    on:click={() => window.location.reload()}
                    class="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                >
                    Retry
                </button>
            </div>
        {:else if patient}
            <!-- Header -->
            <div class="bg-gradient-to-r from-[#F41A53] to-pink-600 rounded-lg p-8 mb-6 shadow-xl">
                <div class="flex items-center gap-4">
                    <div class="bg-white bg-opacity-20 p-4 rounded-full">
                        <User size="48" />
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold">{patient.full_name || "No Name"}</h1>
                        <p class="text-white text-opacity-90 mt-1">Patient Medical Profile</p>
                    </div>
                </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-6 mb-6 shadow-lg">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <Mail class="text-[#F41A53]" size="24" />
                    Contact Information
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center gap-3">
                        <Mail size="18" class="text-gray-400" />
                        <div>
                            <p class="text-xs text-gray-400">Email</p>
                            <p class="font-medium">{patient.email}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <Phone size="18" class="text-gray-400" />
                        <div>
                            <p class="text-xs text-gray-400">Phone</p>
                            <p class="font-medium">{patient.phone || "Not provided"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Medical Information -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-6 mb-6 shadow-lg border-l-4 border-red-500">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle class="text-red-400" size="24" />
                    Medical Information
                </h2>
                <div class="space-y-4">
                    <div>
                        <p class="text-xs text-gray-400 mb-2 flex items-center gap-2">
                            <FileText size="14" />
                            Medical Conditions
                        </p>
                        <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                            <p class="text-lg">{patient.medical_conditions || "None reported"}</p>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 mb-2 flex items-center gap-2">
                            <Pill size="14" />
                            Current Medications
                        </p>
                        <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                            <p class="text-lg">{patient.current_medications || "None reported"}</p>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 mb-2 flex items-center gap-2">
                            <AlertCircle size="14" />
                            Symptoms
                        </p>
                        <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                            <p class="text-lg">{patient.symptoms || "None reported"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Physical Stats -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-6 mb-6 shadow-lg">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <Activity class="text-[#F41A53]" size="24" />
                    Vital Statistics
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex items-center gap-3 bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                        <Ruler size="24" class="text-blue-400" />
                        <div>
                            <p class="text-xs text-gray-400">Height</p>
                            <p class="text-2xl font-bold">
                                {patient.height ? `${patient.height} cm` : "Not provided"}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                        <Weight size="24" class="text-green-400" />
                        <div>
                            <p class="text-xs text-gray-400">Weight</p>
                            <p class="text-2xl font-bold">
                                {patient.weight ? `${patient.weight} kg` : "Not provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Appointments -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar class="text-[#F41A53]" size="24" />
                    Appointment History ({appointments.length})
                </h2>

                {#if appointments.length === 0}
                    <div class="bg-gray-800 bg-opacity-50 p-6 rounded-lg text-center text-gray-400">
                        <Calendar size="48" class="mx-auto mb-2 opacity-50" />
                        <p>No appointments found for this patient</p>
                    </div>
                {:else}
                    <div class="space-y-4">
                        {#each appointments as appointment (appointment.id)}
                            <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg border-l-4 {
                                appointment.status === 'completed' ? 'border-green-500' :
                                appointment.status === 'cancelled' ? 'border-red-500' :
                                'border-yellow-500'
                            }">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <p class="font-semibold text-lg">{formatDate(appointment.appointment_date)}</p>
                                        <p class="text-sm text-gray-400 mt-1">
                                            Service: <span class="capitalize">{appointment.service_name}</span>
                                        </p>
                                        <p class="text-sm text-gray-400">
                                            Status: <span class="capitalize font-semibold {
                                                appointment.status === 'completed' ? 'text-green-400' :
                                                appointment.status === 'cancelled' ? 'text-red-400' :
                                                'text-yellow-400'
                                            }">{appointment.status}</span>
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-xs text-gray-400">Payment Status</p>
                                        <p class="font-semibold {
                                            appointment.payment_status === 'paid' ? 'text-green-400' :
                                            appointment.payment_status === 'failed' ? 'text-red-400' :
                                            'text-yellow-400'
                                        } capitalize">{appointment.payment_status}</p>
                                    </div>
                                </div>

                                <div class="bg-gray-900 bg-opacity-50 p-3 rounded mt-3">
                                    <div class="flex justify-between items-center mb-2">
                                        <p class="text-xs text-gray-400 flex items-center gap-1">
                                            <FileText size="14" />
                                            Consultation Notes
                                        </p>
                                        <button
                                            on:click={() => saveNotes(appointment.id, appointment.notes)}
                                            disabled={savingNotes[appointment.id]}
                                            class="text-xs px-3 py-1 bg-[#F41A53] hover:bg-pink-600 rounded flex items-center gap-1 transition disabled:opacity-50"
                                        >
                                            {#if savingNotes[appointment.id]}
                                                <Loader2 size="12" class="animate-spin" />
                                            {:else}
                                                <Save size="12" />
                                            {/if}
                                            Edit Notes
                                        </button>
                                    </div>
                                    <p class="text-gray-300 text-sm">
                                        {appointment.notes || "No notes added yet"}
                                    </p>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</section>

<style>
    section {
        font-family: "Montserrat", sans-serif;
    }
</style>
