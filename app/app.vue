<template>
  <div class="bg-[#F1F4F9]">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <!-- Open the modal using ID.showModal() method -->
  <dialog ref="modalRef" id="my_modal_1" class="modal">
    <div class="modal-box md:w-[400px] w-11/12 bg-white rounded-2xl">
      <h3 class="text-lg font-bold text-center">Привет! Нужно авторизоваться</h3>
      <div class="flex flex-col gap-2 mt-5 items-center">
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">Логин</legend>
          <input type="text" v-model="login"
            class=" rounded-2xl bg-[#F1F4F9] pl-6 py-2.5 w-full text-md placeholder:text-md focus:outline-none"
            placeholder="..." />
        </fieldset>
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">Пароль</legend>
          <input type="password" v-model="password"
            class=" rounded-2xl bg-[#F1F4F9] pl-6 py-2.5 w-full text-md placeholder:text-md focus:outline-none"
            placeholder="..." />
        </fieldset>
      </div>
      <div class="modal-action w-full">
        <!-- if there is a button in form, it will close the modal -->
        <button
          class="rounded-2xl bg-[#3176FF] text-white px-4 py-3 text-base cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="loginUser" :disabled="buttonDisabled">Авторизоваться</button>
      </div>
    </div>
  </dialog>
  <ToastHost />
</template>

<script setup>
  import MainService from './services/mainService';
  import ToastHost from './components/ToastHost.vue';

  const { show: toast } = useToast();

  const isAuth = useState('isAuth', () => false);
  const showLoginModal = useState('showLoginModal', () => false);
  const modalRef = ref(null);
  const mainService = new MainService();
  const buttonDisabled = computed(() => {
    return login.value.length < 4 || password.value.length < 4;
  })

  const login = ref('');
  const password = ref('');


  const loginUser = async () => {
    // console.log(login.value, password.value);
    // isAuth.value = true;
    // showLoginModal.value = false;
    const authData = await mainService.login(login.value, password.value);
    if (authData) {
    isAuth.value = true;
    showLoginModal.value = false;
    toast('Успешная авторизация', 'success', 3000);
    const authTokenCookie = useCookie('authToken4clk', {
      maxAge: 60 * 60 * 24 * 7, // 1 день 
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    authTokenCookie.value = authData.token;
    } else {
      toast.error('Авторизация не удалась');
    }
  }

  watch(showLoginModal, (show) => {
    if (modalRef.value) {
      if (show) {
        modalRef.value.showModal();
      } else {
        modalRef.value.close();
      }
    }
  });

  const checkAuth = () => {
    const authToken = useCookie('authToken4clk');
    if (authToken.value) {
      isAuth.value = true;
      showLoginModal.value = false;
    }
  }

  onMounted(() => {
    checkAuth();
    if (modalRef.value) {
      // Слушаем события закрытия модального окна
      modalRef.value.addEventListener('close', () => {
        showLoginModal.value = false;
      });
    }

    if (!isAuth.value) {
      showLoginModal.value = true;
    }
  });
</script>

<!-- Глобальный контейнер для тостов -->
