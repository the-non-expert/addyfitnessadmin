<script lang="ts">
    let navOptions = [
        { id: 1, name: "Training", redirectUrl: "/training" },
        { id: 2, name: "Nutrition", redirectUrl: "/nutrition" },
        { id: 3, name: "Healthcare", redirectUrl: "/healthcare" },
        { id: 4, name: "Management", redirectUrl: "/management" },
        { id: 5, name: "Careers", redirectUrl: "/careers" },
    ];
</script>

<nav class="w-full sticky top-0 z-30 px-4 py-3 bg-transparent">
    <div
        class="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10"
    >
        {#each navOptions as item (item.id)}
            <a href={item.redirectUrl} class="funky-button text-center">
                {item.name}
            </a>
        {/each}
    </div>
</nav>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=swap");

    nav,
    a {
        font-family: "Montserrat", sans-serif;
    }

    .funky-button {
        font-size: 1rem;
        font-weight: 600;
        padding: 0.6rem 1.2rem;
        border-radius: 9999px;
        background: linear-gradient(135deg, #F41A53);
        color: white;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        min-width: 120px;
    }

    .funky-button:hover {
        transform: scale(1.05) rotate(-2deg);
        background: linear-gradient(135deg, #ffffff);
        color: black;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .funky-button::after {
        content: "✨";
        position: absolute;
        top: -10px;
        right: -10px;
        opacity: 0;
        transform: scale(0);
        transition: all 0.3s ease;
    }

    .funky-button:hover::after {
        opacity: 1;
        transform: scale(1.5) rotate(10deg);
    }

    @media (max-width: 640px) {
        .funky-button {
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
        }
    }
</style>
