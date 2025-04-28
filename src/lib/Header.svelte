<script lang="ts">
    import { gsToHttp } from "$lib/utils/gsToHttp.js";

    let image = "gs://addyfitness-db121.appspot.com/AddyFitnessTMlogo.png";

    let navOptions = [
        { id: 1, name: "Training", redirectUrl: "/training" },
        { id: 2, name: "Nutrition", redirectUrl: "/nutrition" },
        { id: 3, name: "Healthcare", redirectUrl: "/healthcare" },
        { id: 4, name: "Management", redirectUrl: "/management" },
        { id: 5, name: "Careers", redirectUrl: "/careers" },
    ];
</script>

<nav class="w-full bg-white sticky top-0 z-30 border-b border-gray-100">
    <div class="mx-auto flex items-center justify-between">
        <!-- Logo (left) -->
        <a href="/" class="flex-shrink-0 mr-8">
            <img
                src={gsToHttp(image)}
                alt="AddyFitness Logo"
                class="h-28 w-auto object-contain"
            />
        </a>
        <!-- Nav links (center) -->
        <div class=" flex justify-center space-x-8 mr-24">
            {#each navOptions as item (item.id)}
                <a
                    href={item.redirectUrl}
                    class="text-xl font-semibold tracking-tight text-gray-800 hover:text-[#F41952] transition-colors duration-150 py-1 relative after:content-[''] after:block after:h-[2px] after:w-0 after:bg-[#F41952] after:transition-all after:duration-200 hover:after:w-full after:absolute after:left-0 after:-bottom-0.5"
                >
                    {item.name}
                </a>
            {/each}
        </div>
    </div>
</nav>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=swap");
    nav,
    a {
        font-family: "Montserrat", sans-serif;
    }
</style>
