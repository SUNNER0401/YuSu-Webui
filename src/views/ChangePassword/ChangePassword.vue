<template>
  <div class="change-password-container">
    <alert variant="danger" class="mb-4">
      <p v-if="changePasswordError">
        {{ $t('pageChangePassword.changePasswordError') }}
      </p>
      <p v-else>{{ $t('pageChangePassword.changePasswordAlertMessage') }}</p>
    </alert>
    <div class="change-password__form-container">
      <dl>
        <dt>
          <label for="change-page-username">
            {{ $t('pageChangePassword.username') }}
          </label>
        </dt>
        <dd>
          <b-input id="change-page-username" :value="username" readonly />
        </dd>
      </dl>
      <b-form novalidate @submit.prevent="changePassword">
        <b-form-group
          label-for="password"
          :label="$t('pageChangePassword.newPassword')"
        >
          <input-password-toggle>
            <b-form-input
              id="password"
              v-model="form.password"
              autofocus="autofocus"
              type="password"
              :state="getValidationState($v.form.password)"
              class="form-control-with-button"
              @change="$v.form.password.$touch()"
            >
            </b-form-input>
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.password.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
            </b-form-invalid-feedback>
          </input-password-toggle>
        </b-form-group>
        <b-form-group
          label-for="password-confirm"
          :label="$t('pageChangePassword.confirmNewPassword')"
        >
          <input-password-toggle>
            <b-form-input
              id="password-confirm"
              v-model="form.passwordConfirm"
              type="password"
              :state="getValidationState($v.form.passwordConfirm)"
              class="form-control-with-button"
              @change="$v.form.passwordConfirm.$touch()"
            >
            </b-form-input>
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.passwordConfirm.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-else-if="!$v.form.passwordConfirm.sameAsPassword">
                {{ $t('global.form.passwordsDoNotMatch') }}
              </template>
            </b-form-invalid-feedback>
          </input-password-toggle>
        </b-form-group>
        <div class="text-right">
          <b-button type="button" variant="link" @click="goBack">
            {{ $t('pageChangePassword.goBack') }}
          </b-button>
          <b-button type="submit" variant="primary">
            {{ $t('pageChangePassword.changePassword') }}
          </b-button>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script lang="ts">
import { required, sameAs } from 'vuelidate/lib/validators';
import Alert from '@/components/Global/Alert';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'ChangePassword',
  components: { Alert, InputPasswordToggle },
  mixins: [VuelidateMixin, BVToastMixin],
  data() {
    return {
      form: {
        password: null,
        passwordConfirm: null,
      },
      username: this.$store.getters['global/username'],
      changePasswordError: false,
    };
  },
  // @ts-ignore
  validations() {
    return {
      form: {
        password: { required },
        passwordConfirm: {
          required,
          sameAsPassword: sameAs('password'),
        },
      },
    };
  },
  methods: {
    goBack() {
      // Remove session created if navigating back to the Login page
      this.$store.dispatch('authentication/logout');
    },
    changePassword() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      let data = {
        originalUsername: this.username,
        password: this.form.password,
      };

      this.$store
        .dispatch('userManagement/updateUser', data)
        .then(() => this.$router.push('/'))
        .catch(() => (this.changePasswordError = true));
    },
  },
};
</script>

<style lang="scss" scoped>
.change-password__form-container {
  @include media-breakpoint-up('md') {
    max-width: 360px;
  }
}
</style>
