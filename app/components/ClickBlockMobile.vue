<template>
  <div class="flex flex-col gap-2 bg-white rounded-2xl p-4 mb-4 relative">
    <div class="flex items-start gap-4">
      <!-- <div class="flex flex-col items-center gap-2">
        <NuxtImg src="/images/icecream.png" alt="Clicker" width="{37}" height="{37}" class="w-[37px] h-[37px]" />
        <div class="text-xs text-[#3A3D44] cursor-pointer hover:underline" @click="$emit('set-search')">
          {{ link.userLogin || '—' }}
        </div>
      </div> -->

      <div class="flex flex-col justify-between gap-1 flex-1">
        <div class="tooltip tooltip-secondary" :data-tip="link.name">
          <div class="text-xs text-[#3176FF] line-clamp-1 break-all">
            <div class="text-base text-[#3A3D44] line-clamp-1 break-all">{{ link.name }}</div>
          </div>
        </div>
        <div class="tooltip tooltip-secondary" :data-tip="link.full">
          <div class="text-xs text-[#3176FF] line-clamp-1 break-all">
            <a :href="link.full" target="_blank">{{ link.full }}</a>
          </div>
        </div>
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
      <!-- <div
        class="relative flex items-center justify-center h-full py-5 text-xl text-[#3A3D44] border-r-offset"
        :class="{ 'cursor-pointer underline': link.stats && link.stats.length > 0 }"
        @click="$emit('showStats', link.id)"
      >
        {{ link.clicks }} клк
      </div> -->
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
    <div class="flex items-center justify-between mt-2">
      <div class="flex-1">
        <a :href="shortLink" target="_blank">{{ shortLink.replace('https://', '') }}</a>
      </div>
      <Icon name="fluent:document-copy-16-filled" class="text-3xl cursor-pointer" @click="copyLink" />
      <div
        class="relative flex items-center justify-end h-full text-xl text-[#3A3D44] border-r-offset w-24"
        :class="{ 'cursor-pointer underline': link.stats && link.stats.length > 0 }"
        @click="$emit('showStats', link.id)"
      >
        {{ link.clicks }} клк
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Link } from '@/types/links';
  import dayjs from 'dayjs';

  const { copy } = useCopy();
  const { show: toast } = useToast();

  const userId = useState('userId', () => null);
  const userRole = useState('userRole', () => null);

  const shortLink = computed(() => 'https://4clk.me/' + props.link.short);

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

  const emit = defineEmits(['deleteLink', 'set-search', 'showStats']);

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

<style></style>
