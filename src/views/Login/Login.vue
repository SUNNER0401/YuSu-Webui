<template>
  <b-form class="login-form" novalidate @submit.prevent="login">
    <div id="corner-1" class="corner"></div>
    <div id="corner-2" class="corner"></div>
    <div id="corner-3" class="corner"></div>
    <div id="corner-4" class="corner"></div>
    <alert class="login-error mb-4" :show="authError" variant="danger">
      <p id="login-error-alert">
        {{ $t('pageLogin.alert.message') }}
      </p>
    </alert>
    <img id="logo" :src="imageUrl" alt="" />
    <b-form-group
      label-cols="3"
      label-for="username"
      :label="$t('pageLogin.username')"
    >
      <b-form-input
        id="username"
        v-model="userInfo.username"
        aria-describedby="login-error-alert username-required"
        :state="getValidationState($v.userInfo.username)"
        type="text"
        autofocus="autofocus"
        data-test-id="login-input-username"
        @input="$v.userInfo.username.$touch()"
      >
      </b-form-input>
      <b-form-invalid-feedback id="username-required" role="alert">
        <template v-if="!$v.userInfo.username.required">
          {{ $t('global.form.fieldRequired') }}
        </template>
      </b-form-invalid-feedback>
    </b-form-group>
    <div class="login-form__section mb-3">
      <b-form-group
        label-cols="3"
        label-for="password"
        :label="$t('pageLogin.password')"
      >
        <input-password-toggle>
          <b-form-input
            id="password"
            v-model="userInfo.password"
            aria-describedby="login-error-alert password-required"
            :state="getValidationState($v.userInfo.password)"
            type="password"
            data-test-id="login-input-password"
            class="form-control-with-button"
            @input="$v.userInfo.password.$touch()"
          >
          </b-form-input>
        </input-password-toggle>
      </b-form-group>
      <b-form-invalid-feedback id="password-required" role="alert">
        <template v-if="!$v.userInfo.password.required">
          {{ $t('global.form.fieldRequired') }}
        </template>
      </b-form-invalid-feedback>
    </div>
    <b-form-group
      label-cols="8"
      label-for="language"
      :label="$t('pageLogin.language')"
    >
      <b-form-select
        id="language"
        v-model="$i18n.locale"
        :options="languages"
        data-test-id="login-select-language"
      ></b-form-select>
    </b-form-group>
    <b-form-checkbox
      id="checkbox-1"
      v-model="status"
      name="checkbox-1"
      value="accepted"
      unchecked-value="not_accepted"
    >
      {{ $t('pageLogin.rememberPassword') }}
    </b-form-checkbox>
    <b-button
      class="mt-3"
      type="submit"
      variant="primary"
      data-test-id="login-button-submit"
      :disabled="disableSubmitButton"
      >{{ $t('pageLogin.logIn') }}</b-button
    >
  </b-form>
</template>

<script lang="ts">
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import i18n from '@/i18n';
import Alert from '@/components/Global/Alert';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import { setRoutes } from '@/env/router/ourbmc';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';

export default {
  name: 'Login',
  components: { Alert, InputPasswordToggle },
  mixins: [VuelidateMixin],
  data() {
    return {
      userInfo: {
        username: Cookies.getJSON('rememberInfo')?.username,
        password: Cookies.getJSON('rememberInfo')?.password,
      },
      disableSubmitButton: false,
      languages: [
        {
          value: 'en-US',
          text: 'English',
        },
        {
          value: 'zh-CN',
          text: '简体中文',
        },
      ],
      status: 'not_accepted',
      imageUrl: process.env.VUE_APP_LOGIN_IMAGE
        ? require(`@/env/assets/images/${process.env.VUE_APP_LOGIN_IMAGE}`)
        : require('@/env/assets/images/OurBMC-logo.png'),
    };
  },
  computed: {
    authError() {
      return this.$store.getters['authentication/authError'];
    },
  },
  // @ts-ignore
  validations: {
    userInfo: {
      username: {
        required,
      },
      password: {
        required,
      },
    },
  },
  created() {
    this.$i18n.locale = localStorage.getItem('storedLanguage') || 'zh-CN';
  },
  methods: {
    reCalculateRoutes() {
      class MyVueRouter extends VueRouter {
        matcher: any;
      }
      const router = new MyVueRouter({
        base: process.env.BASE_URL,
        routes: setRoutes(),
        linkExactActiveClass: 'nav-link--current',
      });
      router.beforeEach((to: any, from: any, next: (arg?: string) => void) => {
        if (
          to.matched.some(
            (record: { meta: { requiresAuth: any } }) =>
              record.meta.requiresAuth
          )
        ) {
          if (this.$store.getters['authentication/isLoggedIn']) {
            next();
            return;
          }
          next('/login');
        } else {
          next();
        }
      });
      this.$router.matcher = router.matcher;
      this.$router.options = router.options;
    },
    login: function () {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.disableSubmitButton = true;
      const username = this.userInfo.username;
      const password = this.userInfo.password;
      this.$store
        .dispatch('authentication/login', { username, password })
        .then(() => {
          localStorage.setItem('storedLanguage', i18n.locale);
          localStorage.setItem('storedUsername', username);
          this.$store.commit('global/setUsername', username);
          this.$store.commit('global/setLanguagePreference', i18n.locale);
          this.reCalculateRoutes();
          return this.$store.dispatch('authentication/getUserInfo', username);
        })
        .then(
          ({
            PasswordChangeRequired,
            RoleId,
          }: {
            PasswordChangeRequired: boolean;
            RoleId: string;
          }) => {
            if (PasswordChangeRequired) {
              this.$router.push('/change-password');
            } else {
              if (localStorage.getItem('LastPathname')) {
                let lastPathName = localStorage.getItem('LastPathname');
                localStorage.removeItem('LastPathname');
                this.$router.push(lastPathName);
              } else {
                this.$router.push('/');
              }
            }
            if (RoleId) {
              this.$store.commit('global/setPrivilege', RoleId);
            }
            if (this.status === 'accepted') {
              Cookies.set(
                'rememberInfo',
                {
                  username: username,
                  password: password,
                },
                { expires: 7 }
              );
            } else {
              Cookies.set(
                'rememberInfo',
                {
                  username: username,
                },
                { expires: 7 }
              );
            }
          }
        )
        .catch((error: string) => console.log(error))
        .finally(() => (this.disableSubmitButton = false));
    },
  },
};
</script>

<style lang="scss" scoped>
img#logo {
  position: relative;
  width: 300px;
  left: 50%;
  transform: translate(-50%);
  margin-bottom: 20px;
}
button[data-v-2c86e14e] {
  background: #046eb8;
  border-color: #046eb8;
  width: 100%;
  &:hover {
    background: #22abff;
  }
}
.login-form {
  position: relative;
  width: 400px;
  margin: auto;
  padding: 30px;
  border-width: 5px;
  border-style: solid;
  border-image: linear-gradient(
      to right,
      transparent 0%,
      #8bdeeb 50%,
      transparent 100%
    )
    1;
  ::v-deep.form-group label {
    color: #444444;
  }
  .form-control.is-invalid {
    border: none !important;
  }
  .corner {
    position: absolute;
    width: 30px;
    height: 30px;
    &#corner-1 {
      top: -3px;
      left: -3px;
      border-left: 3px solid #046eb8;
      border-top: 3px solid #046eb8;
    }
    &#corner-2 {
      top: -3px;
      right: -3px;
      border-right: 3px solid #046eb8;
      border-top: 3px solid #046eb8;
    }
    &#corner-3 {
      bottom: -3px;
      left: -3px;
      border-left: 3px solid #046eb8;
      border-bottom: 3px solid #046eb8;
    }
    &#corner-4 {
      bottom: -3px;
      right: -3px;
      border-right: 3px solid #046eb8;
      border-bottom: 3px solid #046eb8;
    }
  }
}
</style>
