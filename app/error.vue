<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F1F4F9]">
    <div class="text-center max-w-md mx-auto px-4">
      <div class="mb-6">
        <NuxtImg src="/images/icecream.png" alt="4clk.me" width={80} height={80} class="mx-auto" />
      </div>
      <h1 class="text-4xl font-bold text-[#3A3D44] mb-4">404</h1>
      <p class="text-xl text-[#3A3D44] mb-6">Короткая ссылка не найдена</p>
      <p class="text-sm text-[#3A3D44]/70 mb-8">
        Ссылка, которую вы ищете, не существует или была удалена.
      </p>
      <button
        @click="goHome"
        class="rounded-2xl bg-[#3176FF] text-white px-6 py-3 text-base cursor-pointer hover:opacity-80"
      >
        Вернуться на главную
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
  };
}>();

const goHome = () => {
  navigateTo('/');
};
</script>

