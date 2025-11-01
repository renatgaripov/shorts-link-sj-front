<template>
  <div class="toast toast-top toast-end z-9999">
    <div v-for="t in toasts" :key="t.id" class="rounded-lg px-4 py-3 shadow-lg" :class="alertClass(t.type)">
      <span>{{ t.message }}</span>
    </div>
  </div>
  
</template>

<script setup lang="ts">
  const { toasts } = useToast();

  const alertClass = (type: 'info' | 'success' | 'warning' | 'error') => {
    if (type === 'success') return 'bg-[#00A43B] text-white';
    if (type === 'warning') return 'bg-[#FDC700] text-white';
    if (type === 'error') return 'bg-[#FF6266] text-white';
    return '!bg-[#0090B5] text-white';
  }
</script>


