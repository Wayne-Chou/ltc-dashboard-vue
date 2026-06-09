<script setup>
import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/login.css";

const SAVED_USERNAME_KEY = "savedUsername";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { locale, t } = useI18n();

const account = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const isSubmitting = ref(false);

const alertType = ref(null);
const alertMessage = ref("");
const errorKey = ref(null);

const localeOptions = [
  { value: "zh", labelKey: "dashboard.langZh" },
  { value: "en", labelKey: "dashboard.langEn" },
  { value: "ja", labelKey: "dashboard.langJa" },
];

const alertClass = computed(() => {
  if (!alertType.value) return "alert d-none";
  return `alert alert-${alertType.value} d-block`;
});

const passwordInputType = computed(() =>
  showPassword.value ? "text" : "password"
);

const eyeIconClass = computed(() =>
  showPassword.value ? "bi bi-eye" : "bi bi-eye-slash"
);

function showAlert(type, message, key = null) {
  alertType.value = type;
  alertMessage.value = message;
  errorKey.value = key;
}

function hideAlert() {
  alertType.value = null;
  alertMessage.value = "";
  errorKey.value = null;
}

function refreshAlertText() {
  if (errorKey.value) {
    alertMessage.value = t(`login.${errorKey.value}`);
  }
}

watch(locale, () => {
  refreshAlertText();
});

function loadSavedUsername() {
  const saved = localStorage.getItem(SAVED_USERNAME_KEY);
  if (saved) {
    account.value = saved;
    rememberMe.value = true;
  }
}

function saveUsernamePreference() {
  const trimmed = account.value.trim();
  if (rememberMe.value && trimmed) {
    localStorage.setItem(SAVED_USERNAME_KEY, trimmed);
  } else {
    localStorage.removeItem(SAVED_USERNAME_KEY);
  }
}

async function handleSubmit() {
  hideAlert();
  isSubmitting.value = true;

  try {
    const result = await login(account.value.trim(), password.value);

    if (result.ok) {
      if (result.token) {
        authStore.setAuth(result.token);
      }
      saveUsernamePreference();

      const redirect = route.query.redirect;
      if (typeof redirect === "string" && redirect) {
        await router.replace(decodeURIComponent(redirect));
      } else {
        await router.replace({ name: "dashboard" });
      }
      return;
    }

    if (result.status === 401) {
      authStore.logout();
      showAlert("warning", t("login.err401"), "err401");
    } else if (result.networkError) {
      showAlert("danger", t("login.errNetwork"), "errNetwork");
    } else {
      showAlert(
        "danger",
        `${t("login.errServer")} (${result.status})`,
        "errServer"
      );
    }
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  if (route.query.reason === "expired") {
    showAlert("warning", t("login.tokenExpired"), "tokenExpired");
  }

  loadSavedUsername();
});
</script>

<template>
  <div class="d-flex justify-content-center align-items-center vh-100 px-3">
    <div class="card p-5 login-card">
      <h3 id="mainTitle" class="text-center mb-3">
        {{ t("login.mainTitle") }}
      </h3>

      <h4 class="text-center mb-4">
        <i class="bi bi-person-circle me-2"></i>
        <span id="loginTitle">{{ t("login.loginTitle") }}</span>
      </h4>

      <form id="loginForm" novalidate @submit.prevent="handleSubmit">
        <div id="loginAlert" :class="alertClass" role="alert">
          {{ alertMessage }}
        </div>

        <div id="labelAccount" class="mb-2 text-start small">
          {{ t("login.labelAccount") }}
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text"><i class="bi bi-person"></i></span>
          <input
            id="username"
            v-model="account"
            type="text"
            name="username"
            class="form-control"
            autocomplete="username"
            required
            :disabled="isSubmitting"
          />
        </div>

        <div id="labelPassword" class="mb-2 text-start small">
          {{ t("login.labelPassword") }}
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text"><i class="bi bi-lock"></i></span>
          <input
            id="password"
            v-model="password"
            :type="passwordInputType"
            name="password"
            class="form-control"
            autocomplete="current-password"
            required
            :disabled="isSubmitting"
          />
          <span
            id="togglePassword"
            class="input-group-text bg-transparent cursor-pointer"
            role="button"
            tabindex="0"
            :aria-label="
              showPassword ? t('login.hidePassword') : t('login.showPassword')
            "
            @click="showPassword = !showPassword"
            @keydown.enter.prevent="showPassword = !showPassword"
            @keydown.space.prevent="showPassword = !showPassword"
          >
            <i id="eyeIcon" :class="eyeIconClass"></i>
          </span>
        </div>

        <div class="form-check mb-3 text-start">
          <input
            id="rememberMe"
            v-model="rememberMe"
            class="form-check-input"
            type="checkbox"
            :disabled="isSubmitting"
          />
          <label
            id="labelRemember"
            class="form-check-label small"
            for="rememberMe"
          >
            {{ t("login.labelRemember") }}
          </label>
        </div>

        <button
          id="loginBtn"
          type="submit"
          class="btn btn-primary w-100"
          :disabled="isSubmitting"
        >
          <span id="loginBtnText">
            {{ isSubmitting ? t("login.verifying") : t("login.loginBtn") }}
          </span>
          <i class="bi bi-arrow-right-circle ms-2"></i>
        </button>
      </form>

      <div class="text-center mt-3">
        <div id="langTitle" class="text-start mb-2 language-label">
          <i class="bi bi-globe"></i>
          {{ t("login.langTitle") }}
        </div>
        <select
          id="languageSelect"
          v-model="locale"
          class="form-select form-select-sm"
          :disabled="isSubmitting"
        >
          <option
            v-for="opt in localeOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ t(opt.labelKey) }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
