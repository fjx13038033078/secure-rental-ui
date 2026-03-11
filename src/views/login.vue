<template>
  <div class="login">
    <!-- 背景装饰层 -->
    <div class="login-bg">
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
      <div class="bg-shape bg-shape-3"></div>
    </div>

    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <div class="title-box">
        <h3 class="title">{{ title }}</h3>
        <p class="subtitle">基于用户身份验证与数据安全存储的汽车租赁系统</p>
      </div>
      <!-- <el-form-item v-if="tenantEnabled" prop="tenantId" class="form-item-animate">
        <el-select v-model="loginForm.tenantId" filterable :placeholder="proxy.$t('login.selectPlaceholder')" style="width: 100%">
          <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
          <template #prefix><svg-icon icon-class="company" class="el-input__icon input-icon" /></template>
        </el-select>
      </el-form-item> -->
      <el-form-item prop="username" class="form-item-animate">
        <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" :placeholder="proxy.$t('login.username')">
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password" class="form-item-animate">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          :placeholder="proxy.$t('login.password')"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="captchaEnabled" prop="code" class="form-item-animate">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          :placeholder="proxy.$t('login.code')"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" class="login-code-img" @click="getCode" />
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">{{ proxy.$t('login.rememberPassword') }}</el-checkbox>
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          class="login-btn"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">{{ proxy.$t('login.login') }}</span>
          <span v-else>{{ proxy.$t('login.logging') }}</span>
        </el-button>
        <div v-if="register" style="float: right">
          <router-link class="link-type" :to="'/register'">{{ proxy.$t('login.switchRegisterPage') }}</router-link>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, getTenantList } from '@/api/login';
import { authRouterUrl } from '@/api/system/social/auth';
import { useUserStore } from '@/store/modules/user';
import { LoginData, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { HttpStatus } from '@/enums/RespEnum';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const title = import.meta.env.VITE_APP_TITLE;
const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules: ElFormRules = {
  tenantId: [{ required: true, trigger: 'blur', message: t('login.rule.tenantId.required') }],
  username: [{ required: true, trigger: 'blur', message: t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rule.password.required') }],
  code: [{ required: true, trigger: 'change', message: t('login.rule.code.required') }]
};

const codeUrl = ref('');
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 租户开关
const tenantEnabled = ref(true);

// 注册开关
const register = ref(false);
const redirect = ref('/');
const loginRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect && decodeURIComponent(newRoute.query.redirect);
  },
  { immediate: true }
);

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 localStorage 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        localStorage.setItem('tenantId', String(loginForm.value.tenantId));
        localStorage.setItem('username', String(loginForm.value.username));
        localStorage.setItem('password', String(loginForm.value.password));
        localStorage.setItem('rememberMe', String(loginForm.value.rememberMe));
      } else {
        // 否则移除
        localStorage.removeItem('tenantId');
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
      // 调用action的登录方法
      const [err] = await to(userStore.login(loginForm.value));
      if (!err) {
        const redirectUrl = redirect.value || '/';
        await router.push(redirectUrl);
        loading.value = false;
      } else {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          await getCode();
        }
      }
    } else {
      console.log('error submit!', fields);
    }
  });
};

/**
 * 获取验证码
 */
const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    // 刷新验证码时清空输入框
    loginForm.value.code = '';
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    loginForm.value.uuid = data.uuid;
  }
};

const getLoginData = () => {
  const tenantId = localStorage.getItem('tenantId');
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const rememberMe = localStorage.getItem('rememberMe');
  loginForm.value = {
    tenantId: tenantId === null ? String(loginForm.value.tenantId) : tenantId,
    username: username === null ? String(loginForm.value.username) : username,
    password: password === null ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === null ? false : Boolean(rememberMe)
  } as LoginData;
};

/**
 * 获取租户列表
 */
const initTenantList = async () => {
  const { data } = await getTenantList(false);
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      loginForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
};

/**
 * 第三方登录
 * @param type
 */
const doSocialLogin = (type: string) => {
  authRouterUrl(type, loginForm.value.tenantId).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      // 获取授权地址跳转
      window.location.href = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

onMounted(() => {
  getCode();
  initTenantList();
  getLoginData();
});
</script>

<style lang="scss" scoped>
/* 弹簧缓动曲线 */
$spring: cubic-bezier(0.34, 1.56, 0.64, 1);
$spring-soft: cubic-bezier(0.68, -0.55, 0.265, 1.55);
$spring-bounce: cubic-bezier(0.175, 0.885, 0.32, 1.275);

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-image: url('../assets/images/login-background.jpg');
  background-size: cover;
  background-position: center;
}

/* 背景装饰动画 */
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  animation: float 8s ease-in-out infinite;

  &.bg-shape-1 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    top: -100px;
    right: -50px;
    animation-delay: 0s;
  }

  &.bg-shape-2 {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    bottom: 10%;
    left: -50px;
    animation-delay: 2s;
  }

  &.bg-shape-3 {
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, #10b981, #059669);
    bottom: -30px;
    right: 20%;
    animation-delay: 4s;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(15px, -15px) scale(1.05);
  }
  66% {
    transform: translate(-10px, 10px) scale(0.98);
  }
}

.title-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;

  .title {
    margin: 0 0 8px;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    animation: titleBounce 0.8s $spring forwards;
  }

  .subtitle {
    margin: 0;
    font-size: 0.8rem;
    color: #64748b;
    text-align: center;
    line-height: 1.5;
    animation: titleBounce 0.8s $spring 0.1s forwards;
    opacity: 0;
    animation-fill-mode: forwards;
  }

  :deep(.lang-select--style) {
    line-height: 0;
    color: #7483a3;
  }
}

@keyframes titleBounce {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  60% {
    opacity: 1;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  width: 420px;
  padding: 36px 32px 24px;
  z-index: 1;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  animation: formSpringIn 0.8s $spring forwards;
  border: 1px solid rgba(255, 255, 255, 0.8);

  &:hover {
    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.4s $spring;
  }

  .el-input {
    height: 44px;

    input {
      height: 44px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0;
  }
}

/* 表单项依次弹入 */
.form-item-animate {
  animation: itemSpringIn 0.5s $spring forwards;
  opacity: 0;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.28s;
  }
  &:nth-child(4) {
    animation-delay: 0.36s;
  }
  &:nth-child(5) {
    animation-delay: 0.44s;
  }
  &:nth-child(6) {
    animation-delay: 0.52s;
  }
  &:nth-child(7) {
    animation-delay: 0.6s;
  }
}

@keyframes itemSpringIn {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.98);
  }
  70% {
    transform: translateY(-3px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes formSpringIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  60% {
    transform: translateY(-8px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.remember-checkbox {
  margin: 0 0 20px 0;
  animation: itemSpringIn 0.5s $spring 0.5s forwards;
  opacity: 0;
}

.login-btn {
  width: 100%;
  transition: all 0.3s $spring;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 8px 20px -4px rgba(14, 165, 233, 0.4);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 40px;
  float: right;
  transition: transform 0.3s $spring;

  &:hover img {
    transform: scale(1.05);
  }

  img {
    cursor: pointer;
    vertical-align: middle;
    transition: transform 0.3s $spring;
  }
}

.login-code-img {
  height: 40px;
  padding-left: 12px;
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial, serif;
  font-size: 12px;
  letter-spacing: 1px;
}

.link-type {
  transition: color 0.3s $spring;

  &:hover {
    color: #0ea5e9;
  }
}
</style>
