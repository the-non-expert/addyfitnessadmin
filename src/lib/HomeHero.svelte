<script>
    import { fly } from "svelte/transition";
    import NavButtons from "./NavButtons.svelte";
</script>

<div
    class="min-h-screen w-full flex items-center justify-center"
>
    <!-- Content -->
    <section
        class="relative w-full flex items-center justify-center px-4 py-10"
    >
        <div class="max-w-7xl mx-auto text-center">
            <div class="space-y-2">
                <div class="space-y-6">
                    <!-- Small text at top -->
                    <p class="text-gray-400 text-sm">
                        Exclusive Access · Admin Panel 🚦
                    </p>

                    <!-- Main heading -->
                    <h1
                        class="raleway-font text-4xl md:text-5xl font-bold text-white"
                    >
                        Welcome, <span class="text-[#F41952]">Admin</span><br />
                        Your Control Room Awaits
                    </h1>

                    <!-- Description -->
                    <p class="text-gray-300 mx-auto text-xl inter-font">
                        This isn’t just another dashboard—this is the engine
                        room of Addy Fitness.<br />
                        Track, manage, and empower the journeys of thousands. Only
                        a handful ever get to see this side.<br />
                        <span class="italic text-gray-400"
                            >Thank you for keeping us running smoother than a
                            treadmill on max speed.</span
                        >
                    </p>

                    <!-- Metrics - Make them relevant to admin work -->
                    <!-- <div
                        class="flex flex-col sm:flex-row gap-4 justify-center mt-8"
                    >
                        <div
                            class="bg-[#F41952] text-white px-6 py-3 rounded-full flex items-center justify-center gap-2"
                            transition:fly={{ y: 20, duration: 600 }}
                        >
                            <span>10K+ User Records Managed</span>
                        </div>

                        <div
                            class="bg-white text-slate-900 px-6 py-3 rounded-full flex items-center justify-center gap-2"
                            transition:fly={{ y: 20, duration: 800 }}
                        >
                            <span>99.9% Uptime This Month</span>
                        </div>
                    </div> -->
                    <NavButtons />
                </div>
            </div>
        </div>
    </section>
</div>

<style>
    .raleway-font {
        font-family: "Raleway", sans-serif;
        font-optical-sizing: auto;
        font-style: normal;
    }

    .inter-font {
        font-family: "Inter", serif;
        font-optical-sizing: auto;
        font-style: normal;
    }
</style>
