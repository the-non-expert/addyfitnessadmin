<script lang="ts">
    import { page } from "$app/state";

    const currentPath = page.url.pathname;
    const slug = currentPath.split("/").pop();

    function formatSlug(slug: string | undefined) {
        if (!slug) return "";
        return slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    const orders = [
        {
            id: 1,
            customer: "John Doe",
            email: "john@example.com",
            phone: "9876543210",
            plan: "Live Workout Session",
            paymentStatus: "Paid",
            date: "2025-04-29T12:45:00",
        },
        {
            id: 2,
            customer: "Jane Smith",
            email: "jane@example.com",
            phone: null,
            plan: "Yoga",
            paymentStatus: "Pending",
            date: "2025-04-28T09:30:00",
        },
        {
            id: 3,
            customer: "Robert Brown",
            email: null,
            phone: "1234567890",
            plan: "HIIT",
            paymentStatus: "Failed",
            date: "2025-04-27T15:20:00",
        },
    ];

    function formatDate(dateStr: string) {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateStr).toLocaleDateString("en-US", options as any);
    }
</script>

<section class="px-6 py-10 w-full">
    <div class="max-w-7xl mx-auto">
        <div
            class="flex md:flex-row flex-col md:items-baseline items-center justify-between"
        >
            <h2 class="text-2xl font-bold text-white">
                Order History of <span
                    class="md:text-4xl bg-white text-black px-3 py-2 rounded-2xl ml-3"
                    >{formatSlug(slug)}</span
                >
            </h2>
        </div>

        <div class="overflow-x-auto rounded-lg mt-10 shadow-md bg-[#1f2937]">
            <table class="w-full text-sm text-left text-black">
                <thead
                    class="text-xs border-b uppercase bg-white text-[#f41a53]"
                >
                    <tr>
                        <th scope="col" class="px-6 py-4 whitespace-nowrap"
                            >Customer</th
                        >
                        <th scope="col" class="px-6 py-4 whitespace-nowrap"
                            >Email</th
                        >
                        <th scope="col" class="px-6 py-4 whitespace-nowrap"
                            >Phone</th
                        >
                        <th scope="col" class="px-6 py-4 whitespace-nowrap"
                            >Plan</th
                        >
                        <th scope="col" class="px-6 py-4 whitespace-nowrap"
                            >Payment Status</th
                        >
                        <th scope="col" class="px-6 py-4 whitespace-nowrap"
                            >Payment Date</th
                        >
                    </tr>
                </thead>
                <tbody>
                    {#each orders as order}
                        <tr
                            class="border-b border-gray-700 hover:bg-white bg-white transition"
                        >
                            <td class="px-6 py-5 font-semibold"
                                >{order.customer}</td
                            >
                            <td class="px-6 py-5">{order.email ?? "N/A"}</td>
                            <td class="px-6 py-5">{order.phone ?? "N/A"}</td>
                            <td class="px-6 py-5">{order.plan}</td>
                            <td class="px-6 py-5">
                                <span
                                    class={order.paymentStatus === "Paid"
                                        ? "bg-green-500/80 text-black px-4 py-2 rounded-full"
                                        : order.paymentStatus === "Pending"
                                          ? "bg-yellow-500/80 text-black px-4 py-2 rounded-full"
                                          : "bg-red-500/80 text-black px-4 py-2 rounded-full"}
                                >
                                    {order.paymentStatus}
                                </span>
                            </td>
                            <td class="px-6 py-5">{formatDate(order.date)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</section>

<a href="/training">
    <button
        class="text-white font-bold px-10 py-3 bg-[#f41a53] text-center rounded-3xl mb-2 flex gap-2 mx-auto"
        >Go back to previous page?</button
    ></a
>

<style>
    section {
        font-family: "Montserrat", sans-serif;
    }
</style>
