<script lang="ts">
    import { onMount } from "svelte";
    import { Undo2, User, Mail, Phone, Loader2, Shield, Activity, Dumbbell } from "lucide-svelte";
    import { user } from "$lib/stores/auth";
    import { apiGet } from "$lib/api/config";

    let staff = [];
    let filteredStaff = [];
    let loading = true;
    let error = null;

    // Filter state
    let searchQuery = "";
    let roleFilter = "";
    let sortBy = "name-asc";

    // Role options for filtering
    const roleOptions = [
        { value: "", label: "All Roles" },
        { value: "admin", label: "Admins" },
        { value: "doctor", label: "Doctors" },
        { value: "trainer", label: "Trainers" }
    ];

    // Sort options
    const sortOptions = [
        { value: "name-asc", label: "Name (A-Z)" },
        { value: "name-desc", label: "Name (Z-A)" },
        { value: "role-asc", label: "Role (A-Z)" }
    ];

    onMount(async () => {
        try {
            loading = true;
            error = null;

            // Only admins can access staff management
            if ($user && $user.role === 'admin') {
                console.log('Admin user detected - fetching ALL staff members');

                // Fetch all users and filter for staff roles
                try {
                    const data = await apiGet('/users');

                    // Handle response format
                    let allUsers = [];
                    if (Array.isArray(data)) {
                        allUsers = data;
                    } else if (data && data.users && Array.isArray(data.users)) {
                        allUsers = data.users;
                    }

                    // Filter for staff roles only (admin, doctor, trainer)
                    staff = allUsers.filter(u =>
                        u.role === 'admin' || u.role === 'doctor' || u.role === 'trainer'
                    );

                } catch (err) {
                    console.warn('Backend /users endpoint failed:', err);
                    staff = [];
                    error = 'Failed to load staff members. Backend endpoint may not be available yet.';
                }
            } else {
                error = 'Staff management is admin-only.';
            }

            console.log('Parsed staff count:', staff.length);
        } catch (err) {
            console.error("Error fetching staff:", err);
            error = err.message || "Failed to load staff";
        } finally {
            loading = false;
        }
    });

    function viewStaffProfile(staffId: number) {
        window.location.href = `/management/staff/${staffId}`;
    }

    // Apply filters and sorting
    function applyFilters() {
        let result = [...staff];

        // Search filter (name, email, phone)
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            result = result.filter(member =>
                (member.full_name?.toLowerCase().includes(searchLower)) ||
                (member.email?.toLowerCase().includes(searchLower)) ||
                (member.phone?.toLowerCase().includes(searchLower))
            );
        }

        // Role filter
        if (roleFilter) {
            result = result.filter(member => member.role === roleFilter);
        }

        // Sorting
        switch (sortBy) {
            case "name-asc":
                result.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
                break;
            case "name-desc":
                result.sort((a, b) => (b.full_name || "").localeCompare(a.full_name || ""));
                break;
            case "role-asc":
                result.sort((a, b) => (a.role || "").localeCompare(b.role || ""));
                break;
        }

        filteredStaff = result;
    }

    // Reactive filtering
    $: {
        searchQuery;
        roleFilter;
        sortBy;
        if (staff.length > 0) {
            applyFilters();
        } else {
            filteredStaff = [];
        }
    }

    function getRoleIcon(role: string) {
        switch (role) {
            case 'admin': return Shield;
            case 'doctor': return Activity;
            case 'trainer': return Dumbbell;
            default: return User;
        }
    }

    function getRoleColor(role: string) {
        switch (role) {
            case 'admin': return 'text-yellow-400';
            case 'doctor': return 'text-blue-400';
            case 'trainer': return 'text-green-400';
            default: return 'text-gray-400';
        }
    }

    function getRoleBadgeColor(role: string) {
        switch (role) {
            case 'admin': return 'bg-yellow-900 text-yellow-300 border-yellow-500';
            case 'doctor': return 'bg-blue-900 text-blue-300 border-blue-500';
            case 'trainer': return 'bg-green-900 text-green-300 border-green-500';
            default: return 'bg-gray-900 text-gray-300 border-gray-500';
        }
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
            Staff <span class="text-[#F41A53]">Management</span>
        </h1>
        <p class="mt-4 text-lg sm:text-xl text-gray-300">
            View and manage all staff members across the system.
        </p>
    </div>

    <div class="w-full max-w-7xl">
        {#if loading}
            <div class="flex flex-col items-center justify-center py-20">
                <Loader2 size="48" class="animate-spin text-[#F41A53] mb-4" />
                <p class="text-gray-400">Loading staff members...</p>
            </div>
        {:else if error}
            <div class="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-6 text-center">
                <p class="text-red-300 text-lg font-semibold mb-2">Error Loading Staff</p>
                <p class="text-red-200">{error}</p>
                <button
                    on:click={() => window.location.reload()}
                    class="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                >
                    Retry
                </button>
            </div>
        {:else if staff.length === 0}
            <div class="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-12 text-center">
                <User size="64" class="mx-auto mb-4 text-gray-500" />
                <p class="text-xl text-gray-300 mb-2">No Staff Members Found</p>
                <p class="text-gray-400">
                    No staff members are currently in the system.
                </p>
            </div>
        {:else}
            <!-- Custom Toolbar for Staff Management -->
            <div class="toolbar-container">
                <!-- Search Bar -->
                <div class="search-section">
                    <div class="search-input-wrapper">
                        <input
                            type="text"
                            bind:value={searchQuery}
                            placeholder="Search staff by name, email, or phone..."
                            class="search-input"
                        />
                    </div>
                </div>

                <!-- Filters Row -->
                <div class="filters-row">
                    <!-- Role Filter -->
                    <div class="filter-group">
                        <select bind:value={roleFilter} class="filter-select">
                            {#each roleOptions as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                    </div>

                    <!-- Sort By -->
                    <div class="filter-group">
                        <select bind:value={sortBy} class="filter-select">
                            {#each sortOptions as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                    </div>

                    <!-- Clear Filters -->
                    {#if searchQuery || roleFilter || sortBy !== "name-asc"}
                        <button on:click={() => { searchQuery = ""; roleFilter = ""; sortBy = "name-asc"; }} class="clear-filters-btn">
                            Clear Filters
                        </button>
                    {/if}
                </div>
            </div>

            <!-- Staff Table -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg overflow-hidden shadow-xl">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-[#F41A53]">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Name</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Role</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Assigned Clients</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            {#each filteredStaff as member (member.id)}
                                <tr class="hover:bg-gray-800 transition">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <svelte:component this={getRoleIcon(member.role)} size={18} class={getRoleColor(member.role)} />
                                            <span class="font-medium">
                                                {member.full_name || "No Name"}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold border {getRoleBadgeColor(member.role)}">
                                            {member.role?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2 text-gray-300">
                                            <Mail size="16" class="text-gray-500" />
                                            {member.email}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2 text-gray-300">
                                            <Phone size="16" class="text-gray-500" />
                                            {member.phone || "N/A"}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="text-gray-300">
                                            {member.assigned_clients_count || 0}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <button
                                            on:click={() => viewStaffProfile(member.id)}
                                            class="px-4 py-2 bg-[#F41A53] hover:bg-white hover:text-black rounded-lg text-sm font-semibold transition"
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mt-6 text-center text-gray-400">
                {#if filteredStaff.length < staff.length}
                    Showing <span class="text-white font-semibold">{filteredStaff.length}</span> of <span class="text-white font-semibold">{staff.length}</span> staff members
                {:else}
                    Total Staff: <span class="text-white font-semibold">{staff.length}</span>
                {/if}
            </div>
        {/if}
    </div>
</section>

<style>
    section {
        font-family: "Montserrat", sans-serif;
    }

    .toolbar-container {
        background: rgba(31, 41, 55, 0.5);
        border: 1px solid rgba(75, 85, 99, 0.5);
        border-radius: 0.75rem;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
    }

    .search-section {
        margin-bottom: 1rem;
    }

    .search-input-wrapper {
        position: relative;
        width: 100%;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem;
        background: rgba(17, 24, 39, 0.8);
        border: 1px solid rgba(75, 85, 99, 0.8);
        border-radius: 0.5rem;
        color: white;
        font-size: 0.95rem;
        transition: all 0.2s;
    }

    .search-input:focus {
        outline: none;
        border-color: #F41A53;
        background: rgba(17, 24, 39, 1);
    }

    .filters-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(17, 24, 39, 0.8);
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(75, 85, 99, 0.8);
    }

    .filter-select {
        background: transparent;
        border: none;
        color: white;
        font-size: 0.9rem;
        cursor: pointer;
        outline: none;
        padding: 0.25rem 0.5rem;
        min-width: 120px;
    }

    .filter-select option {
        background: #1f2937;
        color: white;
    }

    .clear-filters-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(244, 26, 83, 0.2);
        border: 1px solid #F41A53;
        color: #F41A53;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        margin-left: auto;
    }

    .clear-filters-btn:hover {
        background: #F41A53;
        color: white;
    }

    @media (max-width: 768px) {
        .filters-row {
            flex-direction: column;
            align-items: stretch;
        }

        .filter-group {
            width: 100%;
        }

        .filter-select {
            width: 100%;
        }

        .clear-filters-btn {
            margin-left: 0;
            width: 100%;
            justify-content: center;
        }
    }
</style>
