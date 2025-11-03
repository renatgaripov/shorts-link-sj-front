<template>
  <div class="w-full mx-auto bg-white">
    <header class="text-primary flex justify-between items-center p-4 max-w-[1100px] w-full mx-auto">
      <div class="flex items-center gap-2 cursor-pointer">
        <NuxtImg src="/images/icecream.png" alt="Clicker" width="{31}" height="{31}" class="w-[31px] h-[31px]" />
        <p class="text-[28px] font-medium text-neutral">4clk.me</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm text-neutral flex items-center gap-2 cursor-pointer" v-if="!isAuth" @click="openLoginModal">
          <Icon name="mdi:login" />
          Вход
        </div>

        <div class="flex items-center gap-3" v-if="isAuth">
          <div class="w-11 h-11 bg-[#F1F4F9] rounded-xl flex items-center justify-center">
            <Icon name="mdi:user" class="text-2xl" />
          </div>
          <div class="text-sm text-neutral mr-6">{{ userLogin || '' }}</div>
          <div class="text-sm text-neutral flex items-center gap-2 cursor-pointer" @click="logout">
            Выход
            <Icon name="mdi:logout" />
          </div>
        </div>
      </div>
    </header>
  </div>
</template>
<script setup>
  const isAuth = useState('isAuth', () => false);
  const showLoginModal = useState('showLoginModal', () => false);

  // Получаем логин из куки
  const userLoginCookie = useCookie('userLogin');
  const userLogin = ref(userLoginCookie.value || '');

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
