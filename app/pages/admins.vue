<template>
  <div class="md:mt-13">
    <div class="flex flex-col md:flex-row md:items-center justify-between">
      <div class="flex flex-col md:flex-row md:items-center md:gap-5 gap-2">
        <div class="text-2xl font-bold text-[#3A3D44]">Администраторы</div>
        <div>
          <fieldset class="fieldset relative">
            <input
              type="text"
              v-model="search"
              class="rounded-2xl bg-white pl-6 py-2.5 w-full md:w-[270px] text-md placeholder:text-md focus:outline-none pr-10"
              placeholder="Для поиска по логину"
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
      </div>
      <div>
        <button
          class="rounded-2xl bg-[#3176FF] text-white px-4 py-3 text-base w-full md:w-[315px] hover:opacity-80 cursor-pointer max-md:mt-4"
          @click="handleCreateAdmin"
        >
          Создать администратора
        </button>
      </div>
    </div>

    <div class="mt-7">
      <template v-if="loading">
        <div class="text-center py-4">Загрузка...</div>
      </template>
      <template v-else>
        <div
          v-for="user in users"
          :key="user.id"
          class="bg-white rounded-2xl p-4 mb-4 flex items-center justify-between md:w-1/2"
        >
          <div class="flex flex-col md:flex-row items-start md:items-center md:gap-2">
            <div class="text-base text-[#3A3D44]">{{ user.login }}</div>
            <div class="text-xs text-[#3A3D44]" v-if="!isMdOrLarger">
              {{ dayjs(user.createdAt).format('DD.MM.YYYY HH:mm') }}
            </div>
          </div>
          <div class="text-sm text-[#3A3D44]" v-if="isMdOrLarger">
            {{ dayjs(user.createdAt).format('DD.MM.YYYY HH:mm') }}
          </div>
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="user.role === 2"
              class="toggle"
              :disabled="isSelf(user.id)"
              @change="changeRole(user.id, user.role === 2 ? 1 : 2)"
            />
            <div class="text-sm text-[#3A3D44]" v-if="user.role === 2">Админ</div>
            <div class="text-sm text-[#3A3D44]" v-else>Юзер</div>
          </div>
          <div>
            <Icon
              name="lucide:edit"
              class="text-xl mr-2 text-[#3A3D44] cursor-pointer hover:opacity-50"
              @click="handleEditAdmin(user)"
            />
            <Icon
              name="mage:trash-fill"
              class="text-2xl text-[#3A3D44] cursor-pointer hover:opacity-50"
              @click="handleDeleteClick(user)"
              :class="{ 'cursor-not-allowed! opacity-50': isSelf(user.id) }"
            />
          </div>
        </div>
        <div v-if="!users.length" class="text-center py-4 text-[#3A3D44]">Ничего не найдено</div>
      </template>
    </div>
  </div>

  <dialog ref="modalRef2" id="my_modal_2" class="modal">
    <div class="modal-box w-full md:w-[700px] max-w-[700px] bg-[#F1F4F9] rounded-2xl p-4 md:p-8">
      <div class="bg-white w-full h-full rounded-2xl p-4 md:px-8 md:py-5">
        <h3 class="text-xl font-bold">
          {{ newAdminData.id ? 'Редактирование администратора' : 'Новый администратор' }}
        </h3>
        <div class="flex gap-6 my-4 max-md:flex-col">
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend font-normal">Логин</legend>
            <input
              type="text"
              v-model="newAdminData.login"
              class="rounded-lg bg-white pl-2 md:pl-6 py-2.5 text-md border border-[#D9E5FF] placeholder:text-md focus:outline-none"
              placeholder="vasya"
            />
            <p v-if="error.login" class="label text-red-500">{{ error.login }}</p>
          </fieldset>

          <fieldset class="fieldset flex-1 relative">
            <legend class="fieldset-legend font-normal">Пароль</legend>
            <input
              type="text"
              v-model="newAdminData.password"
              class="rounded-lg bg-white pl-2 md:pl-6 py-2.5 text-md border border-[#D9E5FF] placeholder:text-md focus:outline-none"
              placeholder="********"
            />
            <p v-if="error.password" class="label text-red-500">{{ error.password }}</p>
            <div class="absolute -top-7 left-16">
              <Icon
                name="fad:random-2dice"
                class="text-3xl text-[#3A3D44] cursor-pointer hover:opacity-50"
                @click="generatePassword"
              />
            </div>
          </fieldset>
        </div>
      </div>

      <div class="modal-action w-full flex items-center justify-end">
        <button
          class="rounded-2xl bg-[#3176FF] w-[210px] text-white py-3 text-base cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="saveAdmin"
          :disabled="!isFormValid"
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
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <dialog ref="modalRef3" id="my_modal_3" class="modal">
    <div class="modal-box w-[700px] max-w-[700px] bg-[#F1F4F9] rounded-2xl p-8">
      <div class="text-lg">Удалить пользователя "{{ newAdminData.login }}"?</div>
      <div class="modal-action w-full flex items-center gap-5">
        <button
          class="rounded-2xl bg-white text-[#3176FF] border border-[#3176FF] px-4 py-3 text-base w-[215px] hover:opacity-80 cursor-pointer"
          @click="closeModal3"
        >
          Отмена
        </button>
        <button
          class="rounded-2xl bg-[#FF6266] text-white px-4 py-3 text-base w-[215px] hover:opacity-80 cursor-pointer"
          @click="deleteAdmin"
          :disabled="isSelf(newAdminData.id || '')"
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

<script lang="ts" setup>
  import MainService from '~/services/mainService';
  import dayjs from 'dayjs';
  import type { CookieOptions } from '#app';

  interface IAdmin {
    id: string;
    login: string;
    createdAt: Date;
    role: 1 | 2 | null;
  }

  const mainService = new MainService();
  const { show: toast } = useToast();

  const search = ref('');
  const users = ref<IAdmin[]>([]);
  const loading = ref(false);

  const userRole = useState<number | null>('userRole', () => null);
  const userId = useState<string | null>('userId', () => null);

  const isSelf = (id: string) => userId.value === id;

  const breakpoints = useBreakpoints({
    md: 768,
  });
  const isMdOrLarger = breakpoints.greaterOrEqual('md');

  const modalRef2 = ref<HTMLDialogElement | null>(null);
  const modalRef3 = ref<HTMLDialogElement | null>(null);

  const newAdminData = ref<{ id: string | null; login: string; password: string }>({
    login: '',
    password: '',
    id: null,
  });

  const error = ref<{ login?: string; password?: string }>({});

  const cookieOptions = {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    readonly: false,
  } satisfies CookieOptions<string>;

  const meta = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const debouncedSearch = useDebounce(search, 500);

  watch(debouncedSearch, async (newSearch) => {
    await getAllAdmins(newSearch, meta.value.page);
  });

  const resetForm = () => {
    newAdminData.value = { login: '', password: '', id: null };
    error.value = {};
  };

  const openModal2 = () => {
    modalRef2.value?.showModal();
  };

  const closeModal2 = () => {
    modalRef2.value?.close();
    error.value = {};
  };

  const openModal3 = () => {
    modalRef3.value?.showModal();
  };

  const closeModal3 = () => {
    modalRef3.value?.close();
  };

  const handleCreateAdmin = () => {
    resetForm();
    openModal2();
  };

  const handleEditAdmin = (user: IAdmin) => {
    newAdminData.value = { ...user, password: '' };
    error.value = {};
    openModal2();
  };

  const handleDeleteClick = (user: IAdmin) => {
    if (isSelf(user.id)) return;
    newAdminData.value = { ...user, password: '' };
    openModal3();
  };

  const changeRole = async (id: string, role: 1 | 2) => {
    try {
      await mainService.updateAdmin(id, { role });
      userRole.value = role;

      const userRoleCookie = useCookie('rr4clk', cookieOptions);
      if (isSelf(id)) {
        userRoleCookie.value = String(role * 124235346534634623421342352363465476588);
      }

      const target = users.value.find((user) => user.id === id);
      if (target) {
        target.role = role;
      }
      toast('Роль изменена', 'success', 3000);
    } catch (error) {
      toast('Ошибка изменения роли', 'error', 3000);
    }
  };

  const generatePassword = () => {
    newAdminData.value.password =
      Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
  };

  const isFormValid = computed(() => {
    const { login, password, id } = newAdminData.value;
    if (!login || login.length < 2 || login.length > 50) {
      return false;
    }

    if (!id) {
      return password.length >= 8 && password.length <= 15;
    }

    if (!password) {
      return true;
    }

    return password.length >= 8 && password.length <= 15;
  });

  const validateForm = (): boolean => {
    error.value = {};
    const { login, password, id } = newAdminData.value;

    if (!login) {
      error.value.login = 'Логин обязателен';
    } else if (login.length < 2) {
      error.value.login = 'Логин должен быть не менее 2 символов';
    } else if (login.length > 50) {
      error.value.login = 'Логин должен быть не более 50 символов';
    }

    if (!id) {
      if (!password) {
        error.value.password = 'Пароль обязателен';
      } else if (password.length < 8) {
        error.value.password = 'Пароль должен быть не менее 8 символов';
      } else if (password.length > 15) {
        error.value.password = 'Пароль должен быть не более 15 символов';
      }
    } else if (password) {
      if (password.length < 8) {
        error.value.password = 'Пароль должен быть не менее 8 символов';
      } else if (password.length > 15) {
        error.value.password = 'Пароль должен быть не более 15 символов';
      }
    }

    return Object.keys(error.value).length === 0;
  };

  const saveAdmin = async () => {
    if (!validateForm()) return;
    try {
      if (newAdminData.value.id) {
        await mainService.updateAdmin(newAdminData.value.id, {
          login: newAdminData.value.login,
          password: newAdminData.value.password || undefined,
        });
        toast('Администратор обновлён', 'success', 3000);
      } else {
        await mainService.createAdmin({
          login: newAdminData.value.login,
          password: newAdminData.value.password,
        });
        toast('Администратор создан', 'success', 3000);
      }
      await getAllAdmins(search.value);
      resetForm();
      closeModal2();
    } catch (error) {
      toast('Ошибка сохранения администратора', 'error', 3000);
    }
  };

  const deleteAdmin = async () => {
    const id = newAdminData.value.id;
    if (!id || isSelf(id)) return;
    try {
      await mainService.deleteAdmin(id);
      toast('Администратор удалён', 'success', 3000);
      await getAllAdmins(search.value);
      closeModal3();
      resetForm();
    } catch (error) {
      toast('Ошибка удаления администратора', 'error', 3000);
    }
  };

  const getAllAdmins = async (searchQuery: string = '', page: number = 1) => {
    loading.value = true;
    try {
      const res = await mainService.getAllAdmins(searchQuery, page);
      users.value = (res as any).data;
      meta.value = (res as any).meta;
    } catch (error) {
      users.value = [];
      toast('Ошибка получения администраторов', 'error', 3000);
    } finally {
      loading.value = false;
    }
  };

  watch(userRole, (newRole) => {
    if (newRole !== 2) {
      navigateTo('/');
    }
  });

  onMounted(() => {
    getAllAdmins();
    if (userRole.value !== 2) {
      navigateTo('/');
    }
  });
</script>

<style></style>
