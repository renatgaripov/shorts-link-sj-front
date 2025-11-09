<template>
  <div class="w-full mx-auto bg-white">
    <header class="text-primary flex justify-between items-center p-4 max-w-[1100px] w-full mx-auto">
      <div class="flex items-center gap-2 cursor-pointer" @click="navigateTo('/')">
        <NuxtImg src="/images/icecream.png" alt="Clicker" width="{31}" height="{31}" class="w-[31px] h-[31px]" />
        <p class="text-[28px] font-medium text-neutral">4clk.me</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm text-neutral flex items-center gap-2 cursor-pointer" v-if="!isAuth" @click="openLoginModal">
          <Icon name="mdi:login" />
          Вход
        </div>

        <div class="flex items-center gap-3" v-if="isAuth && isMdOrLarger">
          <div
            v-if="userRole === 2"
            class="flex items-center gap-2 cursor-pointer underline"
            @click="navigateTo('/admins')"
          >
            <Icon name="mdi:admin" />
            Админы
          </div>
          <div class="w-11 h-11 bg-[#F1F4F9] rounded-xl flex items-center justify-center">
            <Icon name="mdi:user" class="text-2xl" />
          </div>
          <div class="text-sm text-neutral mr-6">{{ userLogin || '' }}</div>
          <div class="text-sm text-neutral flex items-center gap-2 cursor-pointer" @click="logout">
            Выход
            <Icon name="mdi:logout" />
          </div>
        </div>

        <div v-else-if="isAuth && !isMdOrLarger" ref="dropdownRef" class="relative">
          <button
            type="button"
            class="btn m-1 rounded-xl"
            @click="toggleDropdown"
            aria-haspopup="true"
            :aria-expanded="dropdownOpen"
          >
            ...
          </button>
          <Transition name="fade">
            <ul
              v-if="dropdownOpen"
              class="absolute right-0 top-10 mb-2 menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm"
            >
              <li v-if="userRole === 2">
                <button type="button" class="w-full text-left" @click="goAdmins">Админы</button>
              </li>
              <li>
                <button type="button" class="w-full text-left" @click="handleLogout">Выход</button>
              </li>
            </ul>
          </Transition>
        </div>
      </div>
    </header>
  </div>
</template>
<script setup>
  const isAuth = useState('isAuth', () => false);
  const showLoginModal = useState('showLoginModal', () => false);
  const userRole = useState('userRole', () => null);
  // Получаем логин из куки
  const userLoginCookie = useCookie('userLogin');
  const userLogin = ref(userLoginCookie.value || '');

  const breakpoints = useBreakpoints({
    md: 768,
  });

  const isMdOrLarger = breakpoints.greaterOrEqual('md');

  const dropdownRef = ref(null);
  const dropdownOpen = ref(false);
  const closeDropdown = () => {
    dropdownOpen.value = false;
  };
  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
  };

  const goAdmins = () => {
    closeDropdown();
    navigateTo('/admins');
  };

  const handleLogout = () => {
    closeDropdown();
    logout();
  };

  onClickOutside(dropdownRef, () => {
    dropdownOpen.value = false;
  });

  // Отслеживаем изменения куки
  watch(
    () => userLoginCookie.value,
    (newValue) => {
      userLogin.value = newValue || '';
    }
  );

  const logout = () => {
    isAuth.value = false;
    showLoginModal.value = true;

    const authTokenCookie = useCookie('authToken4clk');
    authTokenCookie.value = null;

    // Очищаем логин
    userLoginCookie.value = null;
    userLogin.value = '';
  };

  const openLoginModal = () => {
    showLoginModal.value = true;
  };

  // Проверяем логин при монтировании
  onMounted(() => {
    if (isAuth.value && userLoginCookie.value) {
      userLogin.value = userLoginCookie.value;
    }
  });
</script>
