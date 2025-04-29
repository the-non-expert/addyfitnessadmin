<script lang="ts">
    import {
        Dumbbell,
        Undo2,
        Activity,
        HeartPulse,
        Heart,
    } from "lucide-svelte"; // Example icons if you want

    const categories = [
        { id: 1, title: "Live Workout Session", icon: Dumbbell, active: true },
        { id: 2, title: "Yoga", icon: Activity, active: true },
        { id: 3, title: "HIIT & LIIT", icon: HeartPulse, active: true },
        { id: 5, title: "Senior Workout", icon: Activity, active: true },
    ];

    function goToCategory(
        category:
            | {
                  id: number;
                  title: string;
                  icon: typeof Dumbbell;
                  active: boolean;
              }
            | { id: number; title: string; icon: null; active: boolean },
    ) {
        if (category.active) {
            window.location.href = `/training/${category.title.toLowerCase().replace(/\s|$begin:math:text$|$end:math:text$/g, "-")}`;
        }
    }
</script>

<section
    class="min-h-screen flex flex-col justify-center items-center text-white px-6"
>
    <a
        href="/"
        class="text-white font-bold px-10 py-3 bg-black items-center rounded-3xl mb-2 flex gap-2"
    >
        <span>Go back to the home panel</span> <Undo2 /></a
    >

    <div class="text-center mb-12">
        <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight">
            Welcome to <span class="text-[#F41A53]">Addy Training Hub</span>
        </h1>
        <p class="mt-4 text-lg sm:text-xl text-gray-300">
            Choose a category to view course purchases, insights, and
            performance logs.
        </p>
    </div>

    <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl"
    >
        {#each categories as cat}
            <button
                class="flex items-center justify-center gap-3 bg-[#F41A53] hover:bg-white hover:text-black text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300
                    {cat.active
                    ? 'cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'}"
                on:click={() => goToCategory(cat)}
                disabled={!cat.active}
            >
                {#if cat.icon}
                    <svelte:component this={cat.icon} size="24" />
                {/if}
                {cat.title}
            </button>
        {/each}
    </div>
</section>

<style>
    section {
        font-family: "Montserrat", sans-serif;
    }
</style>
