<script lang="ts">
    import { Search, Filter, SortAsc, X } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    // Props for customization
    export let showServiceTypeFilter = false;
    export let serviceTypeOptions = [];
    export let showPaymentFilter = false;
    export let showDateFilter = false;
    export let searchPlaceholder = "Search by name, email, or phone...";
    export let initialSortBy = "name-asc";

    // Filter states
    let searchQuery = "";
    let selectedServiceType = "";
    let selectedPaymentStatus = "";
    let sortBy = initialSortBy;
    let dateFrom = "";
    let dateTo = "";

    // Payment status options
    const paymentStatuses = [
        { value: "", label: "All Payments" },
        { value: "active", label: "Active" },
        { value: "overdue", label: "Overdue" },
        { value: "cancelled", label: "Cancelled" }
    ];

    // Sort options
    const sortOptions = [
        { value: "name-asc", label: "Name (A-Z)" },
        { value: "name-desc", label: "Name (Z-A)" },
        { value: "date-newest", label: "Newest First" },
        { value: "date-oldest", label: "Oldest First" }
    ];

    // Reactive: Dispatch filter changes
    $: {
        dispatch("filter", {
            search: searchQuery,
            serviceType: selectedServiceType,
            paymentStatus: selectedPaymentStatus,
            sortBy: sortBy,
            dateFrom: dateFrom,
            dateTo: dateTo
        });
    }

    function clearAllFilters() {
        searchQuery = "";
        selectedServiceType = "";
        selectedPaymentStatus = "";
        sortBy = initialSortBy;
        dateFrom = "";
        dateTo = "";
        dispatch("clear");
    }

    // Check if any filters are active
    $: hasActiveFilters =
        searchQuery !== "" ||
        selectedServiceType !== "" ||
        selectedPaymentStatus !== "" ||
        sortBy !== initialSortBy ||
        dateFrom !== "" ||
        dateTo !== "";
</script>

<div class="toolbar-container">
    <!-- Search Bar -->
    <div class="search-section">
        <div class="search-input-wrapper">
            <Search size="20" class="search-icon" />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder={searchPlaceholder}
                class="search-input"
            />
            {#if searchQuery}
                <button on:click={() => searchQuery = ""} class="clear-search-btn">
                    <X size="16" />
                </button>
            {/if}
        </div>
    </div>

    <!-- Filters Row -->
    <div class="filters-row">
        <!-- Service Type Filter -->
        {#if showServiceTypeFilter && serviceTypeOptions.length > 0}
            <div class="filter-group">
                <Filter size="16" class="filter-icon" />
                <select bind:value={selectedServiceType} class="filter-select">
                    <option value="">All Types</option>
                    {#each serviceTypeOptions as option}
                        <option value={option.id}>{option.name}</option>
                    {/each}
                </select>
            </div>
        {/if}

        <!-- Payment Status Filter -->
        {#if showPaymentFilter}
            <div class="filter-group">
                <Filter size="16" class="filter-icon" />
                <select bind:value={selectedPaymentStatus} class="filter-select">
                    {#each paymentStatuses as status}
                        <option value={status.value}>{status.label}</option>
                    {/each}
                </select>
            </div>
        {/if}

        <!-- Sort By -->
        <div class="filter-group">
            <SortAsc size="16" class="filter-icon" />
            <select bind:value={sortBy} class="filter-select">
                {#each sortOptions as option}
                    <option value={option.value}>{option.label}</option>
                {/each}
            </select>
        </div>

        <!-- Date Range Filter -->
        {#if showDateFilter}
            <div class="date-filter-group">
                <span class="date-label">From:</span>
                <input type="date" bind:value={dateFrom} class="date-input" />
                <span class="date-label">To:</span>
                <input type="date" bind:value={dateTo} class="date-input" />
            </div>
        {/if}

        <!-- Clear Filters Button -->
        {#if hasActiveFilters}
            <button on:click={clearAllFilters} class="clear-filters-btn">
                <X size="16" />
                Clear Filters
            </button>
        {/if}
    </div>
</div>

<style>
    .toolbar-container {
        background: rgba(31, 41, 55, 0.5);
        border: 1px solid rgba(75, 85, 99, 0.5);
        border-radius: 0.75rem;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        font-family: "Montserrat", sans-serif;
    }

    .search-section {
        margin-bottom: 1rem;
    }

    .search-input-wrapper {
        position: relative;
        width: 100%;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        z-index: 10;
        pointer-events: none;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 3rem;
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

    .clear-search-btn {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        transition: all 0.2s;
    }

    .clear-search-btn:hover {
        color: white;
        background: rgba(244, 26, 83, 0.2);
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

    .date-filter-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(17, 24, 39, 0.8);
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(75, 85, 99, 0.8);
    }

    .date-label {
        color: #9ca3af;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .date-input {
        background: transparent;
        border: none;
        color: white;
        font-size: 0.9rem;
        cursor: pointer;
        outline: none;
        padding: 0.25rem;
    }

    .date-input::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
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

        .filter-group,
        .date-filter-group {
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
