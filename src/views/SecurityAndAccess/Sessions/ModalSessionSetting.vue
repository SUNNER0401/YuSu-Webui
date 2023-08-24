<template>
  <b-modal
    id="modal-session-setting"
    ref="modal"
    :title="$t('pageSessions.table.setting')"
  >
    <b-form id="form-dns" @submit.prevent="handleSubmit">
      <b-row>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageSessions.modal.sessionTimeout')"
            label-for="SessionTimeout"
          >
            <b-form-input
              id="SessionTimeout"
              v-model="form.SessionTimeout"
              type="text"
              :state="getValidationState($v.form.SessionTimeout)"
              @input="$v.form.SessionTimeout.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.SessionTimeout.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="!$v.form.SessionTimeout.numeric">
                {{ $t('global.form.invalidFormat') }}
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
import { required, numeric } from 'vuelidate/lib/validators';

export default {
  name: 'ModalSessionSetting',
  mixins: [VuelidateMixin, BVToastMixin],
  computed: {
    form() {
      return {
        SessionTimeout: this.$$store.getters['sessions/sessionTimeout'],
      };
    },
  },
  // @ts-ignore
  validations() {
    return {
      form: {
        SessionTimeout: {
          required,
          numeric,
        },
      },
    };
  },
  mounted() {
    this.$$store.dispatch('sessions/getSessionTimeout');
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
      });
    },
    async handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.form.SessionTimeout = +this.form.SessionTimeout;
      this.closeModal();
      await this.$$store
        .dispatch('sessions/commitSessionSettings', this.form)
        .then(() => {
          this.successToast(this.$t('pageSessions.table.settingSuccessfully'));
        })
        .catch(() => {
          this.errorToast(this.$t('pageSessions.table.errorSetting'));
        });
    },
  },
};
</script>
