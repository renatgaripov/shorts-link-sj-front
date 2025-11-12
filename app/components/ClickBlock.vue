<template>
  <!-- <div class="w-full bg-white rounded-4xl px-3 py-5 flex items-center justify-betwen gap-5 mb-2.5"> -->
  <div class="flex flex-col items-center justify-center bg-white rounded-l-2xl p-5 gap-2">
    <NuxtImg src="/images/icecream.png" alt="Clicker" width="{47}" height="{47}" class="w-[47px] h-[47px]" />
  </div>
  <div class="flex flex-col justify-between gap-1 pr-5 flex-1 bg-white py-4">
    <div class="text-base text-[#3A3D44] line-clamp-1 break-all">{{ link.name }}</div>
    <a :href="link.full" target="_blank" class="text-xs text-[#3176FF] line-clamp-1 break-all cursor-pointer">{{
      link.full
    }}</a>
    <div class="flex items-center gap-2">
      <div class="text-xs text-[#3A3D44] bg-[#F1F4F9] px-2 py-1 rounded-md w-fit">
        {{ dayjs.utc(link.created_at).local().format('DD.MM.YY HH:mm:ss') || '' }}
      </div>
      <div
        v-if="link.userLogin"
        class="text-xs text-[#3A3D44] bg-[#F1F4F9] px-2 py-1 rounded-md w-fit cursor-pointer hover:underline"
        @click="$emit('set-search')"
      >
        {{ link.userLogin }}
      </div>
    </div>
  </div>
  <div
    class="px-6 bg-white relative flex items-center justify-between h-full py-5 text-base text-[#3176FF] border-x-offset"
  >
    <a :href="shortLink" target="_blank" class="line-clamp-1 break-all cursor-pointer">{{
      shortLink.replace('https://', '')
    }}</a>
    <Icon name="fluent:document-copy-16-filled" class="text-2xl ml-8 shrink-0 cursor-pointer" @click="copyLink" />
  </div>
  <div
    class="px-11 bg-white relative flex items-center justify-center h-full py-5 text-2xl text-[#3A3D44] border-r-offset"
    :class="{ 'cursor-pointer underline': link.stats && link.stats.length > 0 }"
    @click="$emit('showStats', link.id)"
  >
    {{ link.clicks }} {{ rightWords(link.clicks as number) }}
  </div>
  <div class="px-6 flex items-center justify-center bg-white rounded-r-2xl">
    <div
      class="w-11 h-11 bg-[#F1F4F9] rounded-xl flex items-center justify-center cursor-pointer hover:opacity-50"
      :class="{ 'cursor-not-allowed! opacity-50!': link.userId !== userId && userRole !== 2 }"
    >
      <Icon
        name="mage:trash-fill"
        class="text-2xl text-[#3A3D4499]"
        @click="link.userId !== userId && userRole !== 2 ? null : $emit('deleteLink', link.id)"
      />
    </div>
  </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
  import type { Link } from '@/types/links';
  import dayjs from 'dayjs';

  const { copy } = useCopy();
  const { show: toast } = useToast();

  const props = defineProps({
    link: {
      type: Object as () => Link,
      default: () => ({
        id: 0,
        name: '',
        short: '',
        full: '',
        project: '',
        created_at: new Date(),
      }),
    },
  });

  const userId = useState('userId', () => null);
  const userRole = useState('userRole', () => null);
  const emit = defineEmits(['deleteLink', 'showStats', 'set-search']);

  const shortLink = computed(() => 'https://4clk.me/' + props.link.short);

  const copyLink = async () => {
    const ok = await copy(shortLink.value);
    if (ok) toast('Ссылка скопирована', 'success', 3000);
    else toast('Не удалось скопировать', 'error', 3000);
  };

  const rightWords = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'клик';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'клика';
    return 'кликов';
  };
</script>

<style scoped>
  .border-r-offset::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background-color: #e0e0e0;
  }

  .border-x-offset::before,
  .border-x-offset::after {
    content: '';
    position: absolute;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background-color: #e0e0e0;
  }

  .border-x-offset::before {
    left: 0;
  }

  .border-x-offset::after {
    right: 0;
  }
</style>
