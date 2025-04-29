<script>
    // import Header from "$lib/Header.svelte";
    import "../app.css";
</script>

<!-- <Header/> -->
<div
class="min-h-screen w-full bg-slate-900 bg-grid items-center justify-center"
>
<slot />
</div>

<style>
    .bg-grid {
        background-size: 15px 15px;
        background-image: linear-gradient(
                to right,
                rgba(255, 255, 255, 0.05) 1px,
                transparent 1px
            ),
            linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.05) 1px,
                transparent 1px
            );
    }
</style>