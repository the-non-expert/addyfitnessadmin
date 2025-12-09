<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { Undo2, User, Mail, Phone, Apple, Activity, Utensils, Clock, TrendingUp, Ruler, Weight, Loader2, Heart, Calendar } from "lucide-svelte";
    import { getClientProfile } from "$lib/api/nutrition";

    let client = null;
    let loading = true;
    let error = null;

    $: clientId = $page.params.id;

    onMount(async () => {
        try {
            loading = true;
            error = null;

            const data = await getClientProfile(parseInt(clientId));
            client = data;
        } catch (err) {
            console.error("Error fetching client profile:", err);
            error = err.message || "Failed to load client profile";
        } finally {
            loading = false;
        }
    });

    function formatDateOfBirth(dateString: string) {
        if (!dateString) return "Not provided";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function calculateAge(dateString: string) {
        if (!dateString) return null;
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Adjust age if birthday hasn't occurred this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }
</script>

<section
    class="min-h-screen flex flex-col items-center text-white px-6 py-10"
>
    <a
        href="/nutrition/clients"
        class="text-white font-bold px-10 py-3 bg-black items-center rounded-3xl mb-8 flex gap-2 hover:bg-gray-800 transition"
    >
        <Undo2 size="20" /> <span>Back to Clients List</span>
    </a>

    <div class="w-full max-w-5xl">
        {#if loading}
            <div class="flex flex-col items-center justify-center py-20">
                <Loader2 size="48" class="animate-spin text-[#F41A53] mb-4" />
                <p class="text-gray-400">Loading client profile...</p>
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
        {:else if client}
            <!-- Header -->
            <div class="bg-gradient-to-r from-[#F41A53] to-pink-600 rounded-lg p-8 mb-6 shadow-xl">
                <div class="flex items-center gap-4">
                    <div class="bg-white bg-opacity-20 p-4 rounded-full">
                        <User size="48" />
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold">{client.full_name || "No Name"}</h1>
                        <p class="text-white text-opacity-90 mt-1">Nutrition Client Profile</p>
                    </div>
                </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-6 mb-6 shadow-lg">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <Mail class="text-[#F41A53]" size="24" />
                    Contact Information
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="flex items-center gap-3">
                        <Mail size="18" class="text-gray-400" />
                        <div>
                            <p class="text-xs text-gray-400">Email</p>
                            <p class="font-medium">{client.email}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <Phone size="18" class="text-gray-400" />
                        <div>
                            <p class="text-xs text-gray-400">Phone</p>
                            <p class="font-medium">{client.phone || "Not provided"}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <Calendar size="18" class="text-gray-400" />
                        <div>
                            <p class="text-xs text-gray-400">Date of Birth</p>
                            <p class="font-medium">
                                {formatDateOfBirth(client.date_of_birth)}
                                {#if calculateAge(client.date_of_birth)}
                                    <span class="text-gray-400 text-sm ml-1">(Age {calculateAge(client.date_of_birth)})</span>
                                {/if}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nutrition Goals & Plan -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-6 mb-6 shadow-lg">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <Apple class="text-[#F41A53]" size="24" />
                    Nutrition Goals & Plan
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p class="text-xs text-gray-400 mb-1">Goals</p>
                        <p class="text-lg">{client.goals || "No goals set"}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 mb-1">Current Nutrition Plan</p>
                        <div class="flex items-center gap-2">
                            <Apple size="18" class="text-gray-400" />
                            <p class="capitalize">{client.nutrition_plan || "Not assigned"}</p>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 mb-1">Meal Frequency Preference</p>
                        <div class="flex items-center gap-2">
                            <Clock size="18" class="text-gray-400" />
                            <p class="capitalize">{client.meal_frequency || "Not specified"}</p>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 mb-1">Activity Level</p>
                        <div class="flex items-center gap-2">
                            <TrendingUp size="18" class="text-gray-400" />
                            <p class="capitalize">{client.activity_level || "Not specified"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Physical Stats -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-6 mb-6 shadow-lg">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <Activity class="text-[#F41A53]" size="24" />
                    Physical Statistics
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex items-center gap-3 bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                        <Ruler size="24" class="text-blue-400" />
                        <div>
                            <p class="text-xs text-gray-400">Height</p>
                            <p class="text-2xl font-bold">
                                {client.height ? `${client.height} cm` : "Not provided"}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                        <Weight size="24" class="text-green-400" />
                        <div>
                            <p class="text-xs text-gray-400">Weight</p>
                            <p class="text-2xl font-bold">
                                {client.weight ? `${client.weight} kg` : "Not provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dietary Information -->
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-6 mb-6 shadow-lg">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <Utensils class="text-[#F41A53]" size="24" />
                    Dietary Information
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p class="text-xs text-gray-400 mb-1">Dietary Restrictions</p>
                        <p class="text-lg">{client.dietary_restrictions || "None"}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 mb-1">Food Preferences</p>
                        <p class="text-lg">{client.food_preferences || "Not specified"}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 mb-1">Allergies</p>
                        <p class="text-lg">{client.allergies || "None reported"}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 mb-1">Food Dislikes</p>
                        <p class="text-lg">{client.food_dislikes || "None reported"}</p>
                    </div>
                </div>
            </div>

            <!-- Health Information -->
            {#if client.medical_conditions || client.medications}
                <div class="bg-gray-900 bg-opacity-50 rounded-lg p-6 mb-6 shadow-lg">
                    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                        <Heart class="text-[#F41A53]" size="24" />
                        Health Information
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {#if client.medical_conditions}
                            <div>
                                <p class="text-xs text-gray-400 mb-1">Medical Conditions</p>
                                <p class="text-lg">{client.medical_conditions}</p>
                            </div>
                        {/if}
                        {#if client.medications}
                            <div>
                                <p class="text-xs text-gray-400 mb-1">Current Medications</p>
                                <p class="text-lg">{client.medications}</p>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Note about medical info -->
            <div class="mt-6 bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-4 text-center">
                <p class="text-blue-200 text-sm">
                    <strong>Note:</strong> Detailed medical information may be limited for privacy reasons.
                    If you need additional medical details for safety reasons, please consult with the assigned doctor or admin.
                </p>
            </div>
        {/if}
    </div>
</section>

<style>
    section {
        font-family: "Montserrat", sans-serif;
    }
</style>
