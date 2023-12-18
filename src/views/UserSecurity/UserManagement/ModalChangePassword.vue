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
              <template v-if="!$v.form.newPassword.numeric">
                {{ $t('global.form.invalidFormat') }}
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
            let partern1 = /[a-zA-Z]+/;
            let partern2 = /[0-9]+/;
            let partern3 = /\W+/;
            let status =
              partern1.test(trimValue) &&
              partern2.test(trimValue) &&
              partern3.test(trimValue);
            return status;
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
