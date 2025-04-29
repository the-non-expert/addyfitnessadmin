<script>
    import {
        login,
        user,
        expiry,
        logout,
        checkSession,
    } from "$lib/stores/auth";
    import { onMount, onDestroy } from "svelte";

    let password = "";
    let error = "";
    let passwordInput;
    let interval;

    onMount(() => {
        checkSession();
        passwordInput?.focus();

        interval = setInterval(() => {
            if ($expiry && Date.now() >= $expiry) {
                logout();
            }
        }, 1000);
    });

    onDestroy(() => clearInterval(interval));

    const handleSubmit = () => {
        if (!login(password)) {
            error = "Incorrect password. Try again.";
            password = "";
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter") handleSubmit();
    };
</script>

{#if $user === null}
    <div
        class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
        <div
            class="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-2xl shadow-xl w-[90%] max-w-md text-center"
        >
            <h2
                class="text-2xl font-semibold text-slate-900 dark:text-white mb-6"
            >
                🔐 Admin Access
            </h2>

            <input
                bind:this={passwordInput}
                bind:value={password}
                type="password"
                placeholder="Enter Password"
                on:keydown={handleKey}
                class="w-full px-4 py-3 rounded-md border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#F41952] bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 mb-4"
            />

            <button
                on:click={handleSubmit}
                class="w-full bg-[#F41952] hover:bg-pink-700 text-white font-medium py-3 rounded-md transition duration-200"
            >
                Login
            </button>

            {#if error}
                <p class="text-red-500 mt-4 text-sm">{error}</p>
            {/if}
        </div>
    </div>
{/if}
