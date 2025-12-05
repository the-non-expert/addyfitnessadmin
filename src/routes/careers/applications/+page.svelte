<script lang="ts">
    import { onMount } from "svelte";
    import { Undo2, User, Mail, Phone, Loader2, Briefcase, Calendar, FileText } from "lucide-svelte";
    import { user } from "$lib/stores/auth";

    let applications = [];
    let filteredApplications = [];
    let loading = true;
    let error = null;

    // Filter state
    let searchQuery = "";
    let positionFilter = "";
    let statusFilter = "";
    let sortBy = "date-newest";

    // Position options
    const positionOptions = [
        { value: "", label: "All Positions" },
        { value: "doctor", label: "Doctor" },
        { value: "trainer", label: "Trainer" },
        { value: "nutritionist", label: "Nutritionist" },
        { value: "admin", label: "Administrator" }
    ];

    // Status options
    const statusOptions = [
        { value: "", label: "All Statuses" },
        { value: "pending", label: "Pending Review" },
        { value: "reviewing", label: "Under Review" },
        { value: "interview", label: "Interview Scheduled" },
        { value: "accepted", label: "Accepted" },
        { value: "rejected", label: "Rejected" }
    ];

    // Sort options
    const sortOptions = [
        { value: "date-newest", label: "Newest First" },
        { value: "date-oldest", label: "Oldest First" },
        { value: "name-asc", label: "Name (A-Z)" }
    ];

    onMount(async () => {
        try {
            loading = true;
            error = null;

            // Only admins can access job applications
            if ($user && $user.role === 'admin') {
                console.log('Admin user detected - loading job applications');

                // TODO: Replace with actual API call when backend is ready
                // For now, showing placeholder/mock data
                applications = [
                    {
                        id: 1,
                        applicant_name: "Dr. Sarah Johnson",
                        email: "sarah.johnson@example.com",
                        phone: "+1-555-0123",
                        position: "doctor",
                        status: "interview",
                        applied_date: "2025-01-15",
                        experience_years: 8,
                        resume_url: "/resumes/sarah-johnson.pdf"
                    },
                    {
                        id: 2,
                        applicant_name: "Mike Roberts",
                        email: "mike.roberts@example.com",
                        phone: "+1-555-0456",
                        position: "trainer",
                        status: "pending",
                        applied_date: "2025-01-18",
                        experience_years: 5,
                        resume_url: "/resumes/mike-roberts.pdf"
                    },
                    {
                        id: 3,
                        applicant_name: "Lisa Chen",
                        email: "lisa.chen@example.com",
                        phone: "+1-555-0789",
                        position: "nutritionist",
                        status: "reviewing",
                        applied_date: "2025-01-20",
                        experience_years: 6,
                        resume_url: "/resumes/lisa-chen.pdf"
                    }
                ];

                console.log('Loaded mock applications:', applications.length);
            } else {
                error = 'Career applications management is admin-only.';
            }
        } catch (err) {
            console.error("Error fetching applications:", err);
            error = err.message || "Failed to load applications";
        } finally {
            loading = false;
        }
    });

    function viewApplication(applicationId: number) {
        window.location.href = `/careers/applications/${applicationId}`;
    }

    // Apply filters and sorting
    function applyFilters() {
        let result = [...applications];

        // Search filter (name, email, phone)
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            result = result.filter(app =>
                (app.applicant_name?.toLowerCase().includes(searchLower)) ||
                (app.email?.toLowerCase().includes(searchLower)) ||
                (app.phone?.toLowerCase().includes(searchLower))
            );
        }

        // Position filter
        if (positionFilter) {
            result = result.filter(app => app.position === positionFilter);
        }

        // Status filter
        if (statusFilter) {
            result = result.filter(app => app.status === statusFilter);
        }

        // Sorting
        switch (sortBy) {
            case "date-newest":
                result.sort((a, b) => new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime());
                break;
            case "date-oldest":
                result.sort((a, b) => new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime());
                break;
            case "name-asc":
                result.sort((a, b) => (a.applicant_name || "").localeCompare(b.applicant_name || ""));
                break;
        }

        filteredApplications = result;
    }

    // Reactive filtering
    $: {
        searchQuery;
        positionFilter;
        statusFilter;
        sortBy;
        if (applications.length > 0) {
            applyFilters();
        } else {
            filteredApplications = [];
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'pending': return 'bg-yellow-900 text-yellow-300 border-yellow-500';
            case 'reviewing': return 'bg-blue-900 text-blue-300 border-blue-500';
            case 'interview': return 'bg-purple-900 text-purple-300 border-purple-500';
            case 'accepted': return 'bg-green-900 text-green-300 border-green-500';
            case 'rejected': return 'bg-red-900 text-red-300 border-red-500';
            default: return 'bg-gray-900 text-gray-300 border-gray-500';
        }
    }

    function formatPosition(position: string) {
        return position.charAt(0).toUpperCase() + position.slice(1);
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
            Career <span class="text-[#F41A53]">Applications</span>
        </h1>
        <p class="mt-4 text-lg sm:text-xl text-gray-300">
            Review and manage job applications for AddyFitness positions.
        </p>
    </div>

    <div class="w-full max-w-7xl">
        {#if loading}
            <div class="flex flex-col items-center justify-center py-20">
                <Loader2 size="48" class="animate-spin text-[#F41A53] mb-4" />
                <p class="text-gray-400">Loading applications...</p>
            </div>
        {:else if error}
            <div class="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-6 text-center">
                <p class="text-red-300 text-lg font-semibold mb-2">Error Loading Applications</p>
                <p class="text-red-200">{error}</p>
                <button
                    on:click={() => window.location.reload()}
                    class="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                >
                    Retry
                </button>
            </div>
        {:else if applications.length === 0}
            <div class="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-12 text-center">
                <Briefcase size="64" class="mx-auto mb-4 text-gray-500" />
                <p class="text-xl text-gray-300 mb-2">No Applications Yet</p>
                <p class="text-gray-400">
                    No job applications have been submitted.
                </p>
            </div>
        {:else}
            <!-- Custom Toolbar -->
            <div class="toolbar-container">
                <!-- Search Bar -->
                <div class="search-section">
                    <div class="search-input-wrapper">
                        <input
                            type="text"
                            bind:value={searchQuery}
                            placeholder="Search by name, email, or phone..."
                            class="search-input"
                        />
                    </div>
                </div>

                <!-- Filters Row -->
                <div class="filters-row">
                    <!-- Position Filter -->
                    <div class="filter-group">
                        <Briefcase size="16" class="filter-icon" />
                        <select bind:value={positionFilter} class="filter-select">
                            {#each positionOptions as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                    </div>

                    <!-- Status Filter -->
                    <div class="filter-group">
                        <FileText size="16" class="filter-icon" />
                        <select bind:value={statusFilter} class="filter-select">
                            {#each statusOptions as option}
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
                    {#if searchQuery || positionFilter || statusFilter || sortBy !== "date-newest"}
                        <button on:click={() => { searchQuery = ""; positionFilter = ""; statusFilter = ""; sortBy = "date-newest"; }} class="clear-filters-btn">
                            Clear Filters
                        </button>
                    {/if}
                </div>
            </div>

            <!-- Applications Table -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg overflow-hidden shadow-xl">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-[#F41A53]">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Applicant</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Position</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Experience</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Applied Date</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            {#each filteredApplications as app (app.id)}
                                <tr class="hover:bg-gray-800 transition">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <User size="18" class="text-gray-400" />
                                            <span class="font-medium">
                                                {app.applicant_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <Briefcase size="16" class="text-gray-500" />
                                            <span class="text-gray-300">
                                                {formatPosition(app.position)}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-gray-300 text-sm">
                                            <div class="flex items-center gap-2 mb-1">
                                                <Mail size="14" class="text-gray-500" />
                                                {app.email}
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <Phone size="14" class="text-gray-500" />
                                                {app.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="text-gray-300">
                                            {app.experience_years} years
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2 text-gray-300">
                                            <Calendar size="16" class="text-gray-500" />
                                            <span class="text-sm">
                                                {formatDate(app.applied_date)}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold border {getStatusColor(app.status)}">
                                            {app.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <button
                                            on:click={() => viewApplication(app.id)}
                                            class="px-4 py-2 bg-[#F41A53] hover:bg-white hover:text-black rounded-lg text-sm font-semibold transition"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mt-6 text-center text-gray-400">
                {#if filteredApplications.length < applications.length}
                    Showing <span class="text-white font-semibold">{filteredApplications.length}</span> of <span class="text-white font-semibold">{applications.length}</span> applications
                {:else}
                    Total Applications: <span class="text-white font-semibold">{applications.length}</span>
                {/if}
            </div>

            <!-- Note about mock data -->
            <div class="mt-6 bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-4 text-center">
                <p class="text-blue-300 text-sm">
                    <strong>Note:</strong> This page currently shows mock data. Integration with backend job applications API coming soon.
                </p>
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

    .filter-icon {
        color: #9ca3af;
        flex-shrink: 0;
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
