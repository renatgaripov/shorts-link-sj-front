<template>
    <div class=" w-full mx-auto bg-white">
    <header class="text-primary flex justify-between items-center p-4 max-w-[1100px] w-full mx-auto">
        <div class="flex items-center gap-2 cursor-pointer">
            <NuxtImg src="/images/icecream.png" alt="Clicker" width={31} height={31} class="w-[31px] h-[31px]" />
            <p class="text-[28px] font-medium text-neutral">4clk.me</p>
        </div>
        <div class="flex items-center gap-2">
            <div class="text-sm text-neutral flex items-center gap-2 cursor-pointer" v-if="!isAuth" @click="openLoginModal">
                <Icon name="mdi:login" />
                Вход
            </div>
            <div class="text-sm text-neutral flex items-center gap-2 cursor-pointer" @click="logout" v-if="isAuth">
                
                Выход
                <Icon name="mdi:logout" />
            </div>
        </div>
    </header>
    </div>
</template>
<script setup>
  const isAuth = useState('isAuth', () => false);
  const showLoginModal = useState('showLoginModal', () => false);
  
  const logout = () => {
    isAuth.value = false;
    showLoginModal.value = true;

    const authTokenCookie = useCookie('authToken4clk');
    authTokenCookie.value = null;
  }

  const openLoginModal = () => {
    showLoginModal.value = true;
  }
</script>