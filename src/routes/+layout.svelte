<script>
    import PasswordOverlay from "$lib/PasswordOverlay.svelte";
    import "../app.css";
</script>


<PasswordOverlay />
<div
    class="min-h-screen w-full bg-[#0f172a] bg-[length:32px_32px] bg-center items-center justify-center"
    style="background-image:
      linear-gradient(to right, rgba(94, 234, 212, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(94, 234, 212, 0.05) 1px, transparent 1px);"
>
    <slot />
</div>
