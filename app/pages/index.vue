<template>
  <div class="md:mt-13">
    <div class="flex flex-col md:flex-row md:items-center justify-between">
      <div class="flex flex-col md:flex-row md:items-center md:gap-5 gap-2">
        <div class="text-2xl font-bold text-[#3A3D44]">Ссылки</div>
        <div class="">
          <fieldset class="fieldset relative">
            <input
              type="text"
              v-model="search"
              class="rounded-2xl bg-white pl-6 py-2.5 md:w-[270px] text-md placeholder:text-md focus:outline-none pr-10"
              placeholder="Ссылка или название"
            />
            <Icon
              v-if="search === ''"
              name="mdi:magnify"
              class="text-2xl text-[#231F20]/50 absolute right-3 top-1/2 -translate-y-1/2"
            />
            <Icon
              v-else
              name="mdi:close"
              class="text-2xl text-[#231F20]/50 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              @click="search = ''"
            />
          </fieldset>
        </div>

        <div class="">
          <select
            class="select rounded-full border-none ring-none outline-none focus:outline-none pl-6 pr-10 text-xs text-[#231F20]/50 max-md:w-full"
            v-model="searchUser"
          >
            <option selected value="">Все сотрудники</option>
            <template v-for="user in users" :key="user.id">
              <option :value="user.login">{{ user.login }}</option>
            </template>
          </select>
        </div>
      </div>

      <div>
        <button
          class="rounded-2xl bg-[#3176FF] text-white px-4 py-3 text-base w-[215px] hover:opacity-80 cursor-pointer max-md:mt-4"
          @click="openModal2"
        >
          Сократить ссылку
        </button>
      </div>
    </div>

    <div class="mt-7">
      <template v-if="loading">
        <div class="text-center py-4">Загрузка...</div>
      </template>
      <template v-else>
        <div v-if="isMdOrLarger" class="grid md:grid-cols-[auto_1fr_1fr_auto_auto] gap-y-4">
          <template v-for="link in links" :key="link.id">
            <ClickBlock
              :link="link"
              @deleteLink="deleteLink($event)"
              @showStats="showStats($event)"
              @set-search="search = link.userLogin || ''"
            />
          </template>
        </div>
        <div v-else>
          <template v-for="link in links" :key="link.id">
            <ClickBlockMobile
              :link="link"
              @deleteLink="deleteLink($event)"
              @showStats="showStats($event)"
              @set-search="search = link.userLogin || ''"
            />
          </template>
        </div>
        <div v-if="links.length === 0" class="text-center py-4">
          {{ search ? 'Ничего не найдено' : 'Ссылок пока нет' }}
        </div>
        <div v-if="links.length > 0" ref="loadMoreTrigger" class="h-10 flex items-center justify-center py-4">
          <div v-if="loadingMore" class="text-sm text-[#3A3D44]">Загрузка...</div>
        </div>
      </template>
    </div>
  </div>
  <!-- MODALS -->
  <!-- SHOW STATS -->
  <dialog ref="modalRef4" id="my_modal_4" class="modal">
    <div class="modal-box w-[99%] md:w-[400px] md:max-w-[400px] bg-[#F1F4F9] rounded-2xl p-4 md:p-8">
      <div class="text-lg">Статистика кликов по ссылке "{{ link?.name }}"</div>
      <div class="mt-4">
        <template v-for="stat in link?.stats" :key="stat.date">
          <div class="flex items-center justify-start gap-2">
            <div class="text-sm text-[#3A3D44]">{{ dayjs(stat.date).format('DD.MM.YY') }}</div>
            <div class="text-base font-medium text-[#3A3D44]">{{ stat.clicks }}</div>
          </div>
        </template>
      </div>
      <div class="modal-action w-full flex items-center justify-between">
        <button
          class="rounded-2xl bg-[#3176FF] text-white w-full py-3 text-base cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="closeModal4"
        >
          Закрыть
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
  <!-- new link -->
  <dialog ref="modalRef2" id="my_modal_2" class="modal">
    <div class="modal-box w-full md:w-[700px] md:max-w-[700px] bg-[#F1F4F9] rounded-2xl p-4 md:p-8">
      <div class="bg-white w-full h-full rounded-2xl p-4 md:px-8 md:py-5">
        <h3 class="text-xl font-bold">Сокращение ссылки</h3>
        <div class="flex gap-6 my-4 max-md:flex-col">
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend font-normal">Вставьте ссылку</legend>
            <input
              type="text"
              v-model="newLinkData.full"
              class="rounded-lg bg-white pl-6 py-2.5 text-md border border-[#D9E5FF] placeholder:text-md focus:outline-none"
              placeholder="https://"
            />
            <p v-if="error.full" class="label text-red-500">{{ error.full }}</p>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend font-normal">Задать свой адрес</legend>
            <input
              type="text"
              v-model="newLinkData.short"
              class="rounded-lg bg-white pl-6 py-2.5 text-md border border-[#D9E5FF] placeholder:text-md focus:outline-none"
              placeholder="/"
            />
            <p v-if="error.short" class="label text-red-500">{{ error.short }}</p>
          </fieldset>
        </div>
        <div>
          <fieldset class="fieldset">
            <legend class="fieldset-legend font-normal">Название для ссылки (опционально)</legend>
            <input
              type="text"
              v-model="newLinkData.name"
              class="rounded-lg bg-white pl-6 py-2.5 text-md border border-[#D9E5FF] placeholder:text-md focus:outline-none"
              placeholder="..."
            />
            <p v-if="error.name" class="label text-red-500">{{ error.name }}</p>
          </fieldset>
        </div>
        <div class="modal-action w-full flex items-center justify-between">
          <button
            class="rounded-2xl bg-[#3176FF] text-white w-full py-3 text-base cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="saveLink"
            :disabled="buttonDisabled"
          >
            Сохранить
          </button>

          <button
            class="rounded-2xl border border-[#3176FF] text-[#3176FF] w-[210px] py-3 text-base cursor-pointer hover:opacity-80"
            @click="closeModal2"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
  <!-- remove link -->
  <dialog ref="modalRef3" id="my_modal_3" class="modal">
    <div class="modal-box w-[99%] md:w-[700px] md:max-w-[700px] bg-[#F1F4F9] rounded-2xl p-4 md:p-8">
      <div class="text-lg">Удалить ссылку "{{ deleteName || 'Cсылка' }}"?</div>
      <div class="modal-action w-full flex items-center gap-5">
        <button
          class="rounded-2xl bg-white text-[#3176FF] border border-[#3176FF] px-4 py-3 text-base w-[215px] hover:opacity-80 cursor-pointer"
          @click="closeModal3"
        >
          Отмена
        </button>
        <button
          class="rounded-2xl bg-[#FF6266] text-white px-4 py-3 text-base w-[215px] hover:opacity-80 cursor-pointer"
          @click="deleteLinkService(deleteId!)"
        >
          Удалить
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
  import MainService from '@/services/mainService';
  import type { Link } from '@/types/links';
  import { get } from 'mongoose';
  const { show: toast } = useToast();
  const dayjs = useDayjs();

  const breakpoints = useBreakpoints({
    md: 768,
  });

  const isMdOrLarger = breakpoints.greaterOrEqual('md');

  const mainService = new MainService();

  const modalRef2 = ref(null);
  const modalRef3 = ref(null);
  const modalRef4 = ref(null);
  const link = ref<Link | null>(null);
  const closeModal4 = () => {
    // @ts-ignore
    modalRef4?.value?.close();
  };
  const showStats = (id: number) => {
    link.value = links.value.find((item) => item.id === id) || null;
    // @ts-ignore
    modalRef4?.value?.showModal();
  };
  const newLinkData = ref({
    full: '',
    short: '',
    name: '',
  });

  const search = ref('');
  const loading = ref(false);
  const loadingMore = ref(false);
  const loadMoreTrigger = ref<HTMLElement | null>(null);

  const buttonDisabled = computed(() => {
    return !newLinkData.value.full;
  });

  const links = ref<Link[]>([]);
  const deleteId = ref<number | null>(null);
  const deleteName = ref<string | null>(null);

  const error = ref<{ full?: string; short?: string; name?: string }>({});

  // Мета-информация о пагинации
  const meta = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Используем debounce из vueuse для отложенного поиска
  const debouncedSearch = useDebounce(search, 500);

  // Отслеживаем изменения поискового запроса
  watch(debouncedSearch, async (newSearch) => {
    meta.value.page = 1;
    links.value = [];
    await getAllLinks(newSearch, 1, true);
  });

  // Intersection Observer для бесконечной прокрутки
  useIntersectionObserver(
    loadMoreTrigger,
    (entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting && meta.value.hasNextPage && !loadingMore.value && !loading.value) {
        loadMore();
      }
    },
    {
      threshold: 0.1,
    }
  );

  const deleteLink = (id: number) => {
    deleteName.value = links.value.find((item) => item.id === id)?.name || null;
    deleteId.value = id;
    // @ts-ignore
    modalRef3?.value?.showModal();
  };

  const closeModal3 = () => {
    // @ts-ignore
    modalRef3?.value?.close();
  };

  const openModal2 = () => {
    // @ts-ignore
    modalRef2?.value?.showModal();
  };

  const closeModal2 = () => {
    // @ts-ignore
    modalRef2?.value?.close();
  };

  const deleteLinkService = async (id: number) => {
    if (!deleteId.value) return;
    try {
      const res = await mainService.deleteLink(id);
      // console.log(res);
      closeModal3();
      toast('Ссылка удалена', 'success', 3000);
      links.value = links.value.filter((item) => item.id !== id);
    } catch (error) {
      toast('Ошибка удаления ссылки', 'error', 3000);
      closeModal3();
    }
  };

  const validateForm = (): boolean => {
    // Очищаем предыдущие ошибки
    error.value = {};

    // Валидация full (URL)
    if (!newLinkData.value.full) {
      error.value.full = 'URL обязателен для заполнения';
    } else if (!isValidUrl(newLinkData.value.full)) {
      error.value.full = 'Введите корректный URL';
    }

    // Валидация name
    if (newLinkData.value.name) {
      if (newLinkData.value.name.length < 2) {
        error.value.name = 'Название должно быть не менее 2 символов';
      } else if (newLinkData.value.name.length > 50) {
        error.value.name = 'Название должно быть не более 50 символов';
      }
    }

    // Валидация short (если заполнено)
    if (newLinkData.value.short) {
      if (newLinkData.value.short.length < 2) {
        error.value.short = 'Короткая ссылка должна быть не менее 2 символов';
      } else if (newLinkData.value.short.length > 10) {
        error.value.short = 'Короткая ссылка должна быть не более 10 символов';
      }
    }

    // Функция остановится и вернет false если есть ошибки
    return Object.keys(error.value).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    //
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const saveLink = async () => {
    if (!validateForm()) return;
    // Убираем последний слэш из URL если он есть
    if (newLinkData.value.full.endsWith('/')) {
      newLinkData.value.full = newLinkData.value.full.slice(0, -1);
    }
    try {
      if (!newLinkData.value.name) {
        try {
          const url = new URL(newLinkData.value.full);
          const domain = url.hostname;
          const path = url.pathname.slice(1); // убираем первый слэш
          const pathPreview = path.length > 15 ? path.slice(0, 15) + '...' : path;
          newLinkData.value.name = pathPreview ? `${domain}/${pathPreview}` : domain;
        } catch {
          // fallback на старую логику если URL невалидный
          newLinkData.value.name = newLinkData.value.full.split('/').pop() || '';
        }
      }
      const res = await mainService.createLink(newLinkData.value);
      closeModal2();
      toast('Ссылка сохранена', 'success', 3000);
      meta.value.page = 1;
      links.value = [];
      await getAllLinks(search.value, 1, true); // Перезагружаем с текущим поиском
      newLinkData.value = {
        full: '',
        short: '',
        name: '',
      };
    } catch (error) {
      toast('Ошибка сохранения ссылки', 'error', 3000);
      closeModal2();
    }
  };

  const getAllLinks = async (searchQuery: string = '', page: number = 1, reset: boolean = false) => {
    if (reset) {
      loading.value = true;
    } else {
      loadingMore.value = true;
    }
    try {
      const res = await mainService.getAllLinks(searchQuery, page, meta.value.limit);
      if (res && typeof res === 'object' && 'data' in res && 'meta' in res) {
        const newLinks = (res as any).data as Link[];
        if (reset) {
          links.value = newLinks;
        } else {
          links.value = [...links.value, ...newLinks];
        }
        meta.value = (res as any).meta;
      } else {
        // Fallback для старого формата (если API еще не обновлен)
        if (reset) {
          links.value = res as Link[];
        } else {
          links.value = [...links.value, ...(res as Link[])];
        }
      }
    } catch (error) {
      toast('Ошибка получения ссылок', 'error', 3000);
      if (reset) {
        links.value = [];
      }
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  };

  const loadMore = async () => {
    if (!meta.value.hasNextPage || loadingMore.value || loading.value) return;
    const nextPage = meta.value.page + 1;
    await getAllLinks(search.value, nextPage, false);
  };

  const searchUser = ref('');
  const users = ref<any[]>([]);
  const getUsers = async () => {
    try {
      const res: any = await mainService.getAllAdmins();
      users.value = res.data;
    } catch (error) {
      console.log(error);
    }
  };

  watch(searchUser, async (newSearch) => {
    meta.value.page = 1;
    links.value = [];
    await getAllLinks(newSearch, 1, true);
  });

  onMounted(() => {
    getAllLinks('', 1, true);
    getUsers();
  });

  const ADMIN_DEFAULT = {
    login: 'admin',
    password: 'admin123',
  };
</script>
