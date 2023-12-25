<template>
  <b-modal
    id="modal-change-password"
    ref="modal"
    :title="$t('pageSessions.table.changePassword')"
    @hidden="resetForm"
  >
    <b-form id="form-dns" @submit.prevent="handleSubmit">
      <b-row>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageSessions.modal.newPassword')"
            label-for="SessionTimeout"
          >
            <b-form-input
              id="newPassword"
              v-model="form.newPassword"
              type="text"
              :state="getValidationState($v.form.newPassword)"
              @input="$v.form.newPassword.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.newPassword.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template
                v-if="
                  !$v.form.newPassword.minLength ||
                  !$v.form.newPassword.maxLength
                "
              >
                {{
                  $t('pageUserManagement.modal.passwordMustBeBetween', {
                    min: passwordRequirements.minLength,
                    max: passwordRequirements.maxLength,
                  })
                }}
              </template>
              <template
                v-else-if="
                  $v.form.newPassword.required &&
                  !$v.form.newPassword.pattern &&
                  passwordErrorType == 'error1'
                "
              >
                {{ $t('global.form.simplePassword') }}
              </template>
              <template
                v-else-if="
                  $v.form.newPassword.required &&
                  !$v.form.newPassword.pattern &&
                  passwordErrorType == 'error2'
                "
              >
                {{ $t('global.form.passwordContainUsername') }}
              </template>
              <template
                v-else-if="
                  $v.form.newPassword.required &&
                  !$v.form.newPassword.pattern &&
                  passwordErrorType == 'error3'
                "
              >
                {{ $t('global.form.passwordContainHalfCircle') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
          <b-form-group
            :label="$t('pageSessions.modal.confirmPassword')"
            label-for="SessionTimeout"
          >
            <b-form-input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="text"
              :state="getValidationState($v.form.confirmPassword)"
              @input="$v.form.confirmPassword.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.confirmPassword.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="!$v.form.confirmPassword.sameAs">
                {{ $t('global.form.differentPassword') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button type="submit" variant="primary" @click="onOk">
        {{ $t('global.action.confirm') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { countOccurrences } from '@/utilities/toolFunctions';

import {
  required,
  sameAs,
  minLength,
  maxLength,
} from 'vuelidate/lib/validators';

export default {
  name: 'ModalChangePassword',
  mixins: [VuelidateMixin, BVToastMixin],
  props: {
    user: {
      type: Object,
      default: null,
    },
    passwordRequirements: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {
        newPassword: '',
        confirmPassword: '',
      },
      passwordErrorType: null,
    };
  },
  // @ts-ignore
  validations() {
    return {
      form: {
        newPassword: {
          required,
          minLength: minLength(this.passwordRequirements.minLength),
          maxLength: maxLength(this.passwordRequirements.maxLength),
          pattern: (value: string) => {
            const trimValue = value.trim();

            const resultArray = [
              /[a-z]+/.test(trimValue),
              /[A-Z]+/.test(trimValue),
              /[0-9]+/.test(trimValue),
              /(\W|_)+/.test(trimValue),
            ];
            if (countOccurrences(resultArray, true) >= 2) {
              if (trimValue.indexOf(this.user.UserName) != -1) {
                this.passwordErrorType = 'error2';
                return false;
              }
              if (/(‘|’)+/.test(trimValue)) {
                this.passwordErrorType = 'error3';
                return false;
              }
              this.passwordErrorType = null;
              return true;
            } else {
              this.passwordErrorType = 'error1';
              return false;
            }
          },
        },
        confirmPassword: {
          required,
          sameAsPassword: sameAs('newPassword'),
        },
      },
    };
  },
  methods: {
    onOk(bvModalEvt: { preventDefault: () => void }) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
        this.form.newPassword = '';
        this.form.confirmPassword = '';
        this.$v.$reset();
      });
    },
    resetForm() {
      this.form.newPassword = '';
      this.form.confirmPassword = '';
      this.$v.$reset();
    },
    async handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.closeModal();
      this.$emit('ok', this.form.confirmPassword);
    },
  },
};
</script>
