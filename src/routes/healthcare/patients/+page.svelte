<script lang="ts">
    import { onMount } from "svelte";
    import { Undo2, User, Mail, Phone, Calendar, Loader2, Activity, ChevronDown, ChevronUp, Clock } from "lucide-svelte";
    import { user } from "$lib/stores/auth";
    import { getMyPatients, getMyAppointments } from "$lib/api/doctor";
    import { getAllMembers } from "$lib/api/users";
    import { apiGet } from "$lib/api/config";
    import TableToolbar from "$lib/TableToolbar.svelte";
    import { healthcareSpecialties } from "$lib/data/categories";

    let patients = [];
    let filteredPatients = [];
    let appointments = [];
    let allOrders = []; // Store all healthcare orders
    let loading = true;
    let error = null;
    let expandedPatientId = null; // Track which patient row is expanded

    // Map patient IDs to their next appointment
    let patientAppointments = {};

    // Filter state
    let currentFilters = {
        search: "",
        serviceType: "",
        paymentStatus: "",
        sortBy: "date-newest",
        dateFrom: "",
        dateTo: ""
    };

    onMount(async () => {
        try {
            loading = true;
            error = null;

            console.log('=== HEALTHCARE PAGE DEBUG ===');
            console.log('$user:', $user);
            console.log('$user.role:', $user?.role);

            // Check if user is admin - admins see ALL healthcare patients, doctors see assigned patients
            if ($user && $user.role === 'admin') {
                console.log('Admin user detected - fetching data based on orders');

                // Fetch all orders and all members
                const [ordersData, membersData] = await Promise.all([
                    apiGet('/orders'),
                    getAllMembers()
                ]);

                // Parse members data
                let allMembers = [];
                if (Array.isArray(membersData)) {
                    allMembers = membersData;
                } else if (membersData && membersData.users) {
                    allMembers = membersData.users;
                }

                // Parse orders data
                let allOrdersData = [];
                if (Array.isArray(ordersData)) {
                    allOrdersData = ordersData;
                } else if (ordersData && ordersData.orders) {
                    allOrdersData = ordersData.orders;
                }

                console.log('All members:', allMembers.length);
                console.log('All orders:', allOrdersData.length);

                // Filter orders by service_type='healthcare' and status='paid'
                allOrders = allOrdersData.filter(order =>
                    order.service_type === 'healthcare' && order.status === 'paid'
                );

                console.log('Healthcare orders (filtered by service_type):', allOrders.length);
                console.log('Healthcare orders breakdown by staff_id:', {
                    assigned: allOrders.filter(o => o.staff_id !== null).length,
                    unassigned: allOrders.filter(o => o.staff_id === null).length
                });

                // Get unique user_ids from healthcare orders
                const healthcareUserIds = [...new Set(allOrders.map(order => order.user_id))];

                console.log('Unique healthcare user IDs:', healthcareUserIds);

                // Filter members to only those with healthcare orders
                patients = allMembers.filter(member => healthcareUserIds.includes(member.id));

                console.log('Filtered healthcare patients:', patients.length);

                // Fetch all appointments (admin endpoint)
                const appointmentsData = await apiGet('/appointments');
                appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
                console.log('Fetched appointments:', appointments.length);

            } else if ($user && $user.role === 'doctor') {
                console.log('Doctor user detected - fetching assigned patients only (filtered by staff_id)');

                // Fetch all orders and all members
                const [ordersData, membersData] = await Promise.all([
                    apiGet('/orders'),
                    getAllMembers()
                ]);

                // Parse members data
                let allMembers = [];
                if (Array.isArray(membersData)) {
                    allMembers = membersData;
                } else if (membersData && membersData.users) {
                    allMembers = membersData.users;
                }

                // Parse orders data
                let allOrdersData = [];
                if (Array.isArray(ordersData)) {
                    allOrdersData = ordersData;
                } else if (ordersData && ordersData.orders) {
                    allOrdersData = ordersData.orders;
                }

                console.log('Doctor ID:', $user.id);

                // Filter orders by:
                // 1. service_type='healthcare'
                // 2. status='paid'
                // 3. staff_id matches current doctor
                allOrders = allOrdersData.filter(order =>
                    order.service_type === 'healthcare' &&
                    order.status === 'paid' &&
                    order.staff_id === $user.id
                );

                console.log('My healthcare orders (filtered by service_type + staff_id):', allOrders.length);

                // Get unique user_ids from my healthcare orders
                const myPatientIds = [...new Set(allOrders.map(order => order.user_id))];

                console.log('My assigned patient IDs:', myPatientIds);

                // Filter members to only my assigned patients
                patients = allMembers.filter(member => myPatientIds.includes(member.id));

                console.log('My healthcare patients:', patients.length);

                // Fetch appointments for my patients (doctor endpoint)
                const appointmentsData = await getMyAppointments();
                appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
                console.log('Fetched appointments:', appointments.length);
            } else {
                // Unauthorized role
                error = 'Access denied. Only admins and doctors can access this page.';
            }

            // Create map of patient ID to next appointment
            if (appointments.length > 0) {
                patients.forEach(patient => {
                    const patientAppts = appointments
                        .filter(appt => appt.user_id === patient.id)
                        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

                    if (patientAppts.length > 0) {
                        patientAppointments[patient.id] = patientAppts[0];
                    }
                });
            }

        } catch (err) {
            console.error("Error fetching patients:", err);
            error = err.message || "Failed to load patients";
        } finally {
            loading = false;
        }
    });

    function viewPatientProfile(patientId: number) {
        window.location.href = `/healthcare/patients/${patientId}`;
    }

    // Get total appointment count for a patient (based on healthcare orders)
    function getPatientAppointmentCount(patientId: number) {
        return allOrders.filter(order => order.user_id === patientId).length;
    }

    // Get all appointments for a patient with appointment details (sorted by date descending - newest first)
    function getPatientAppointments(patientId: number) {
        const patientOrders = allOrders.filter(order => order.user_id === patientId);

        console.log('=== DEBUG getPatientAppointments ===');
        console.log('Patient ID:', patientId);
        console.log('Patient orders:', patientOrders);
        console.log('All appointments:', appointments);

        // Enrich orders with appointment data
        const enrichedOrders = patientOrders.map(order => {
            // Find matching appointment - appointments.order_id should match orders.razorpay_order_id
            const appointment = appointments.find(appt => {
                console.log('Comparing:', {
                    order_razorpay_id: order.razorpay_order_id,
                    appt_order_id: appt.order_id,
                    match: appt.order_id === order.razorpay_order_id
                });
                return appt.order_id === order.razorpay_order_id;
            });

            console.log('Order razorpay_order_id:', order.razorpay_order_id, 'Found appointment:', appointment);

            return {
                ...order,
                appointment_date: appointment?.appointment_date || null,
                appointment_time: appointment?.appointment_time || null,
                appointment_notes: appointment?.notes || null
            };
        });

        console.log('Enriched orders:', enrichedOrders);
        return enrichedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Toggle expand/collapse for appointment history
    function toggleExpand(patientId: number) {
        expandedPatientId = expandedPatientId === patientId ? null : patientId;
    }

    // Get badge class based on appointment count
    function getAppointmentBadgeClass(count: number) {
        if (count >= 5) return 'badge-gold';
        if (count >= 3) return 'badge-silver';
        return 'badge-bronze';
    }

    function formatDate(dateString: string) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Handle filter changes from toolbar
    function handleFilterChange(event) {
        currentFilters = event.detail;
        applyFilters();
    }

    // Apply filters and sorting to patients list
    function applyFilters() {
        let result = [...patients];

        // Search filter (name, email, phone)
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            result = result.filter(patient =>
                (patient.full_name?.toLowerCase().includes(searchLower)) ||
                (patient.email?.toLowerCase().includes(searchLower)) ||
                (patient.phone?.toLowerCase().includes(searchLower))
            );
        }

        // Service type filter (healthcare specialty)
        if (currentFilters.serviceType) {
            result = result.filter(patient =>
                patient.healthcare_specialty === currentFilters.serviceType
            );
        }

        // Payment status filter
        if (currentFilters.paymentStatus) {
            result = result.filter(patient =>
                patient.payment_status === currentFilters.paymentStatus
            );
        }

        // Sorting
        switch (currentFilters.sortBy) {
            case "name-asc":
                result.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
                break;
            case "name-desc":
                result.sort((a, b) => (b.full_name || "").localeCompare(a.full_name || ""));
                break;
            case "date-newest":
                result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                break;
            case "date-oldest":
                result.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
                break;
        }

        filteredPatients = result;
    }

    // Apply filters when patients data changes
    $: if (patients.length > 0) {
        applyFilters();
    } else {
        filteredPatients = [];
    }
</script>

<section
    class="min-h-screen flex flex-col items-center text-white px-6 py-10"
>
    <a
        href="/"
        class="text-white font-bold px-10 py-3 bg-black items-center rounded-3xl mb-8 flex gap-2 hover:bg-gray-800 transition"
    >
        <Undo2 size="20" /> <span>Back to Home</span>
    </a>

    <div class="text-center mb-12 max-w-4xl">
        <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight">
            {#if $user?.role === 'admin'}
                All <span class="text-[#F41A53]">Patients</span>
            {:else}
                My <span class="text-[#F41A53]">Patients</span>
            {/if}
        </h1>
        <p class="mt-4 text-lg sm:text-xl text-gray-300">
            {#if $user?.role === 'admin'}
                View and manage all patient consultations across the system.
            {:else}
                View and manage your assigned patient consultations.
            {/if}
        </p>
    </div>

    <div class="w-full max-w-7xl">
        {#if loading}
            <div class="flex flex-col items-center justify-center py-20">
                <Loader2 size="48" class="animate-spin text-[#F41A53] mb-4" />
                <p class="text-gray-400">Loading patients...</p>
            </div>
        {:else if error}
            <div class="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-6 text-center">
                <p class="text-red-300 text-lg font-semibold mb-2">Error Loading Patients</p>
                <p class="text-red-200">{error}</p>
                <button
                    on:click={() => window.location.reload()}
                    class="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                >
                    Retry
                </button>
            </div>
        {:else if patients.length === 0}
            <div class="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-12 text-center">
                <Activity size="64" class="mx-auto mb-4 text-gray-500" />
                <p class="text-xl text-gray-300 mb-2">No Patients Assigned Yet</p>
                <p class="text-gray-400">
                    You don't have any assigned patients. Contact admin to get assigned.
                </p>
            </div>
        {:else}
            <!-- Table Toolbar -->
            <TableToolbar
                showServiceTypeFilter={true}
                serviceTypeOptions={healthcareSpecialties}
                showPaymentFilter={true}
                showDateFilter={false}
                searchPlaceholder="Search patients by name, email, or phone..."
                initialSortBy="date-newest"
                on:filter={handleFilterChange}
            />

            <!-- Patients Table -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg overflow-hidden shadow-xl">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-[#F41A53]">
                            <tr>
                                <th class="px-2 py-4 text-left text-sm font-semibold w-8"></th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Name</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Appointments</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Medical Conditions</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            {#each filteredPatients as patient (patient.id)}
                                <!-- Main Row -->
                                <tr class="hover:bg-gray-800 transition">
                                    <!-- Expand Button -->
                                    <td class="px-2 py-4">
                                        <button
                                            on:click={() => toggleExpand(patient.id)}
                                            class="text-gray-400 hover:text-white transition p-1"
                                            aria-label="Toggle appointment history"
                                        >
                                            {#if expandedPatientId === patient.id}
                                                <ChevronUp size="18" />
                                            {:else}
                                                <ChevronDown size="18" />
                                            {/if}
                                        </button>
                                    </td>

                                    <!-- Name -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <User size="18" class="text-gray-400" />
                                            <span class="font-medium">
                                                {patient.full_name || "No Name"}
                                            </span>
                                        </div>
                                    </td>

                                    <!-- Email -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2 text-gray-300">
                                            <Mail size="16" class="text-gray-500" />
                                            {patient.email}
                                        </div>
                                    </td>

                                    <!-- Phone -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2 text-gray-300">
                                            <Phone size="16" class="text-gray-500" />
                                            {patient.phone || "N/A"}
                                        </div>
                                    </td>

                                    <!-- Appointments Count Badge -->
                                    <td class="px-6 py-4">
                                        <span class="appointment-badge {getAppointmentBadgeClass(getPatientAppointmentCount(patient.id))}">
                                            {getPatientAppointmentCount(patient.id)}
                                        </span>
                                    </td>

                                    <!-- Medical Conditions -->
                                    <td class="px-6 py-4">
                                        <span class="text-gray-300 text-sm truncate max-w-xs block">
                                            {patient.medical_conditions || "None reported"}
                                        </span>
                                    </td>

                                    <!-- Actions -->
                                    <td class="px-6 py-4">
                                        <button
                                            on:click={() => viewPatientProfile(patient.id)}
                                            class="px-4 py-2 bg-[#F41A53] hover:bg-white hover:text-black rounded-lg text-sm font-semibold transition"
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>

                                <!-- Expanded Appointment History Row -->
                                {#if expandedPatientId === patient.id}
                                    <tr class="bg-gray-800 bg-opacity-50">
                                        <td colspan="7" class="px-6 py-4">
                                            <div class="appointment-history-container">
                                                <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                                    <Calendar size="16" class="text-[#F41A53]" />
                                                    Appointment History ({getPatientAppointmentCount(patient.id)} appointments)
                                                </h4>
                                                <div class="space-y-2">
                                                    {#each getPatientAppointments(patient.id) as order}
                                                        <div class="appointment-item">
                                                            <div class="flex items-center justify-between">
                                                                <div class="flex items-center gap-4">
                                                                    <Clock size="14" class="text-gray-400" />
                                                                    <div class="flex flex-col">
                                                                        <span class="text-sm font-medium text-gray-200">
                                                                            {order.title || "Healthcare Appointment"}
                                                                        </span>
                                                                        <span class="text-xs text-gray-400">
                                                                            {#if order.appointment_date}
                                                                                Appointment: {formatDate(order.appointment_date)}
                                                                                {#if order.appointment_time}
                                                                                    at {order.appointment_time}
                                                                                {/if}
                                                                            {:else}
                                                                                Booked: {formatDate(order.created_at)}
                                                                            {/if}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div class="flex items-center gap-4">
                                                                    <span class="text-sm font-semibold text-[#F41A53]">
                                                                        ${order.amount}
                                                                    </span>
                                                                    <span class="text-xs text-gray-400">
                                                                        ID: #{order.id}
                                                                    </span>
                                                                    {#if order.status}
                                                                        <span class="status-badge status-{order.status}">
                                                                            {order.status}
                                                                        </span>
                                                                    {/if}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    {/each}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                {/if}
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mt-6 flex justify-between items-center text-gray-400">
                <div>
                    {#if filteredPatients.length < patients.length}
                        Showing <span class="text-white font-semibold">{filteredPatients.length}</span> of <span class="text-white font-semibold">{patients.length}</span> patients
                    {:else}
                        Total Patients: <span class="text-white font-semibold">{patients.length}</span>
                    {/if}
                </div>
                <div>
                    Upcoming Appointments: <span class="text-white font-semibold">
                        {Object.keys(patientAppointments).length}
                    </span>
                </div>
            </div>
        {/if}
    </div>
</section>

<style>
    section {
        font-family: "Montserrat", sans-serif;
    }

    /* Appointment Badge Styles */
    .appointment-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 28px;
        padding: 0 10px;
        border-radius: 14px;
        font-size: 0.875rem;
        font-weight: 600;
        color: white;
    }

    .badge-gold {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }

    .badge-silver {
        background: linear-gradient(135deg, #C0C0C0 0%, #808080 100%);
        box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
    }

    .badge-bronze {
        background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
        box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
    }

    /* Appointment History Container */
    .appointment-history-container {
        background: rgba(17, 24, 39, 0.5);
        border-radius: 0.5rem;
        padding: 1rem;
        border: 1px solid rgba(75, 85, 99, 0.3);
    }

    .appointment-item {
        background: rgba(31, 41, 55, 0.6);
        padding: 0.75rem;
        border-radius: 0.375rem;
        border: 1px solid rgba(75, 85, 99, 0.3);
        transition: all 0.2s;
    }

    .appointment-item:hover {
        background: rgba(31, 41, 55, 0.8);
        border-color: rgba(244, 26, 83, 0.3);
    }

    /* Status Badges */
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: capitalize;
    }

    .status-scheduled {
        background: rgba(59, 130, 246, 0.2);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .status-completed {
        background: rgba(34, 197, 94, 0.2);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .status-cancelled {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .status-pending {
        background: rgba(234, 179, 8, 0.2);
        color: #fbbf24;
        border: 1px solid rgba(234, 179, 8, 0.3);
    }
</style>
