<script lang="ts">
    import { onMount } from "svelte";
    import { Undo2, User, Mail, Phone, Loader2, ChevronDown, ChevronUp, Calendar, DollarSign, Package } from "lucide-svelte";
    import { user } from "$lib/stores/auth";
    import { getAllMembers } from "$lib/api/users";
    import { apiGet } from "$lib/api/config";
    import TableToolbar from "$lib/TableToolbar.svelte";
    import { trainingCategories } from "$lib/data/categories";

    let clients = [];
    let filteredClients = [];
    let loading = true;
    let error = null;
    let allOrders = []; // Store all orders for order count calculation
    let expandedClientId = null; // Track which client row is expanded

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

            console.log('=== TRAINING PAGE DEBUG ===');
            console.log('$user:', $user);
            console.log('$user.role:', $user?.role);

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

                // Parse orders data and store globally
                if (Array.isArray(ordersData)) {
                    allOrders = ordersData;
                } else if (ordersData && ordersData.orders) {
                    allOrders = ordersData.orders;
                }

                console.log('All members:', allMembers.length);
                console.log('All orders:', allOrders.length);

                // Filter orders by service_type='training' and status='paid'
                const trainingOrders = allOrders.filter(order =>
                    order.service_type === 'training' && order.status === 'paid'
                );

                console.log('Training orders (filtered by service_type):', trainingOrders.length);
                console.log('Training orders breakdown by staff_id:', {
                    assigned: trainingOrders.filter(o => o.staff_id !== null).length,
                    unassigned: trainingOrders.filter(o => o.staff_id === null).length
                });

                // Get unique user_ids from training orders
                const trainingUserIds = [...new Set(trainingOrders.map(order => order.user_id))];

                console.log('Unique training user IDs:', trainingUserIds);

                // Filter members to only those with training orders
                clients = allMembers.filter(member => trainingUserIds.includes(member.id));

                console.log('Filtered training clients:', clients.length);

            } else if ($user && $user.role === 'trainer') {
                console.log('Trainer user detected - fetching assigned clients only (filtered by staff_id)');

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

                // Parse orders data and store globally
                if (Array.isArray(ordersData)) {
                    allOrders = ordersData;
                } else if (ordersData && ordersData.orders) {
                    allOrders = ordersData.orders;
                }

                console.log('Trainer ID:', $user.id);

                // Filter orders by:
                // 1. service_type='training'
                // 2. status='paid'
                // 3. staff_id matches current trainer
                const myTrainingOrders = allOrders.filter(order =>
                    order.service_type === 'training' &&
                    order.status === 'paid' &&
                    order.staff_id === $user.id
                );

                console.log('My training orders (filtered by service_type + staff_id):', myTrainingOrders.length);

                // Get unique user_ids from my training orders
                const myClientIds = [...new Set(myTrainingOrders.map(order => order.user_id))];

                console.log('My assigned client IDs:', myClientIds);

                // Filter members to only my assigned clients
                clients = allMembers.filter(member => myClientIds.includes(member.id));

                console.log('My training clients:', clients.length);
            } else {
                // Unauthorized role
                error = 'Access denied. Only admins and trainers can access this page.';
            }
        } catch (err) {
            console.error("Error fetching clients:", err);
            error = err.message || "Failed to load clients";
        } finally {
            loading = false;
        }
    });

    function viewClientProfile(clientId: number) {
        window.location.href = `/training/clients/${clientId}`;
    }

    // Get order count for a specific client
    function getClientOrderCount(clientId: number) {
        return allOrders.filter(order =>
            order.user_id === clientId &&
            order.service_type === 'training' &&
            order.status === 'paid'
        ).length;
    }

    // Get all orders for a specific client
    function getClientOrders(clientId: number) {
        return allOrders
            .filter(order =>
                order.user_id === clientId &&
                order.service_type === 'training' &&
                order.status === 'paid'
            )
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    // Get the most recent order date for a client
    function getLastOrderDate(clientId: number) {
        const orders = getClientOrders(clientId);
        if (orders.length === 0) return null;
        return orders[0].created_at;
    }

    // Format date
    function formatDate(dateString: string) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Toggle expansion for a client row
    function toggleExpand(clientId: number) {
        expandedClientId = expandedClientId === clientId ? null : clientId;
    }

    // Get badge color based on order count
    function getOrderBadgeClass(count: number) {
        if (count >= 5) return 'badge-gold';
        if (count >= 3) return 'badge-silver';
        return 'badge-bronze';
    }

    // Handle filter changes from toolbar
    function handleFilterChange(event) {
        currentFilters = event.detail;
        applyFilters();
    }

    // Apply filters and sorting to clients list
    function applyFilters() {
        let result = [...clients];

        // Search filter (name, email, phone)
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            result = result.filter(client =>
                (client.full_name?.toLowerCase().includes(searchLower)) ||
                (client.email?.toLowerCase().includes(searchLower)) ||
                (client.phone?.toLowerCase().includes(searchLower))
            );
        }

        // Service type filter
        if (currentFilters.serviceType) {
            result = result.filter(client =>
                client.training_type === currentFilters.serviceType
            );
        }

        // Payment status filter
        if (currentFilters.paymentStatus) {
            result = result.filter(client =>
                client.payment_status === currentFilters.paymentStatus
            );
        }

        // Date range filter (if needed in future)
        // ...

        // Sorting
        switch (currentFilters.sortBy) {
            case "name-asc":
                result.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
                break;
            case "name-desc":
                result.sort((a, b) => (b.full_name || "").localeCompare(a.full_name || ""));
                break;
            case "date-newest":
                result.sort((a, b) => {
                    const aLastOrder = getLastOrderDate(a.id);
                    const bLastOrder = getLastOrderDate(b.id);
                    return new Date(bLastOrder || 0).getTime() - new Date(aLastOrder || 0).getTime();
                });
                break;
            case "date-oldest":
                result.sort((a, b) => {
                    const aLastOrder = getLastOrderDate(a.id);
                    const bLastOrder = getLastOrderDate(b.id);
                    return new Date(aLastOrder || 0).getTime() - new Date(bLastOrder || 0).getTime();
                });
                break;
        }

        filteredClients = result;
    }

    // Apply filters when clients data changes
    $: if (clients.length > 0) {
        applyFilters();
    } else {
        filteredClients = [];
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
                All <span class="text-[#F41A53]">Training Clients</span>
            {:else}
                My <span class="text-[#F41A53]">Training Clients</span>
            {/if}
        </h1>
        <p class="mt-4 text-lg sm:text-xl text-gray-300">
            {#if $user?.role === 'admin'}
                View and manage all fitness clients across the system.
            {:else}
                View and manage your assigned fitness clients.
            {/if}
        </p>
    </div>

    <div class="w-full max-w-7xl">
        {#if loading}
            <div class="flex flex-col items-center justify-center py-20">
                <Loader2 size="48" class="animate-spin text-[#F41A53] mb-4" />
                <p class="text-gray-400">Loading clients...</p>
            </div>
        {:else if error}
            <div class="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-6 text-center">
                <p class="text-red-300 text-lg font-semibold mb-2">Error Loading Clients</p>
                <p class="text-red-200">{error}</p>
                <button
                    on:click={() => window.location.reload()}
                    class="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                >
                    Retry
                </button>
            </div>
        {:else if clients.length === 0}
            <div class="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-12 text-center">
                <User size="64" class="mx-auto mb-4 text-gray-500" />
                <p class="text-xl text-gray-300 mb-2">No Training Clients Yet</p>
                <p class="text-gray-400">
                    {#if $user?.role === 'admin'}
                        No clients have purchased training services yet.
                    {:else}
                        You don't have any assigned clients. Contact admin to get assigned.
                    {/if}
                </p>
            </div>
        {:else}
            <!-- Table Toolbar -->
            <TableToolbar
                showServiceTypeFilter={true}
                serviceTypeOptions={trainingCategories}
                showPaymentFilter={true}
                showDateFilter={false}
                searchPlaceholder="Search clients by name, email, or phone..."
                initialSortBy="date-newest"
                on:filter={handleFilterChange}
            />

            <!-- Clients Table -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg overflow-hidden shadow-xl">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-[#F41A53]">
                            <tr>
                                <th class="px-2 py-4 text-left text-sm font-semibold w-8"></th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Name</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Orders</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Last Order</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            {#each filteredClients as client (client.id)}
                                <!-- Main Row -->
                                <tr class="hover:bg-gray-800 transition">
                                    <!-- Expand Button -->
                                    <td class="px-2 py-4">
                                        <button
                                            on:click={() => toggleExpand(client.id)}
                                            class="text-gray-400 hover:text-white transition"
                                            aria-label="Toggle order history"
                                        >
                                            {#if expandedClientId === client.id}
                                                <ChevronUp size="20" />
                                            {:else}
                                                <ChevronDown size="20" />
                                            {/if}
                                        </button>
                                    </td>

                                    <!-- Name -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <User size="18" class="text-gray-400" />
                                            <span class="font-medium">
                                                {client.full_name || "No Name"}
                                            </span>
                                        </div>
                                    </td>

                                    <!-- Email -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2 text-gray-300">
                                            <Mail size="16" class="text-gray-500" />
                                            {client.email}
                                        </div>
                                    </td>

                                    <!-- Phone -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2 text-gray-300">
                                            <Phone size="16" class="text-gray-500" />
                                            {client.phone || "N/A"}
                                        </div>
                                    </td>

                                    <!-- Orders Count Badge -->
                                    <td class="px-6 py-4">
                                        <span class="order-badge {getOrderBadgeClass(getClientOrderCount(client.id))}">
                                            <Package size="14" />
                                            {getClientOrderCount(client.id)}
                                        </span>
                                    </td>

                                    <!-- Last Order Date -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2 text-gray-400 text-sm">
                                            <Calendar size="14" />
                                            {formatDate(getLastOrderDate(client.id))}
                                        </div>
                                    </td>

                                    <!-- Actions -->
                                    <td class="px-6 py-4">
                                        <button
                                            on:click={() => viewClientProfile(client.id)}
                                            class="px-4 py-2 bg-[#F41A53] hover:bg-white hover:text-black rounded-lg text-sm font-semibold transition"
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>

                                <!-- Expanded Order History Row -->
                                {#if expandedClientId === client.id}
                                    <tr class="bg-gray-800 bg-opacity-50">
                                        <td colspan="7" class="px-6 py-4">
                                            <div class="order-history-container">
                                                <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                                    <Package size="16" class="text-[#F41A53]" />
                                                    Order History ({getClientOrderCount(client.id)} orders)
                                                </h4>
                                                <div class="space-y-2">
                                                    {#each getClientOrders(client.id) as order}
                                                        <div class="order-item">
                                                            <div class="flex items-center justify-between">
                                                                <div class="flex items-center gap-3">
                                                                    <span class="order-id">#{order.id}</span>
                                                                    <span class="text-gray-300">{order.title || 'Training Session'}</span>
                                                                </div>
                                                                <div class="flex items-center gap-4">
                                                                    <span class="flex items-center gap-1 text-green-400">
                                                                        <DollarSign size="14" />
                                                                        {order.amount || 0}
                                                                    </span>
                                                                    <span class="flex items-center gap-1 text-gray-400 text-sm">
                                                                        <Calendar size="14" />
                                                                        {formatDate(order.created_at)}
                                                                    </span>
                                                                    <span class="status-badge status-{order.status}">
                                                                        {order.status}
                                                                    </span>
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

            <div class="mt-6 text-center text-gray-400">
                {#if filteredClients.length < clients.length}
                    Showing <span class="text-white font-semibold">{filteredClients.length}</span> of <span class="text-white font-semibold">{clients.length}</span> clients
                {:else}
                    Total Clients: <span class="text-white font-semibold">{clients.length}</span>
                {/if}
            </div>
        {/if}
    </div>
</section>

<style>
    section {
        font-family: "Montserrat", sans-serif;
    }

    /* Order Badge Styles */
    .order-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
        border: 1px solid;
    }

    .badge-gold {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.2));
        color: #FFD700;
        border-color: #FFD700;
    }

    .badge-silver {
        background: linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(169, 169, 169, 0.2));
        color: #C0C0C0;
        border-color: #C0C0C0;
    }

    .badge-bronze {
        background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(184, 115, 51, 0.2));
        color: #CD7F32;
        border-color: #CD7F32;
    }

    /* Order History Container */
    .order-history-container {
        background: rgba(17, 24, 39, 0.5);
        border-radius: 0.5rem;
        padding: 1rem;
        border: 1px solid rgba(75, 85, 99, 0.3);
    }

    /* Order Item */
    .order-item {
        background: rgba(31, 41, 55, 0.5);
        border: 1px solid rgba(75, 85, 99, 0.5);
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        transition: all 0.2s;
    }

    .order-item:hover {
        background: rgba(31, 41, 55, 0.8);
        border-color: rgba(244, 26, 83, 0.3);
    }

    .order-id {
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        color: #9ca3af;
        font-weight: 600;
    }

    /* Status Badges */
    .status-badge {
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .status-paid {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        border: 1px solid #22c55e;
    }

    .status-created {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        border: 1px solid #3b82f6;
    }

    .status-cancelled {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border: 1px solid #ef4444;
    }
</style>
