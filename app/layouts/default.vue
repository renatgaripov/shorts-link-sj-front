<template>
    <div class="min-h-screen flex flex-col  bg-[#F1F4F9]">
        <Header />
        <main class="flex-1 p-4 max-w-[1100px] w-full mx-auto" v-if="isAuth">
            <slot />
        </main>
        <footer class="bg-white py-2 px-4" v-if="isAuth">
            <p>Copyright 2025 @ 4clk.me</p>
        </footer>
    </div>
</template>
<script setup>
    const isAuth = useState('isAuth', () => false);
</script>
