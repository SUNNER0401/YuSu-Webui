<template>
  <b-modal
    id="modal-session-setting"
    ref="modal"
    :title="$t('pageSessions.table.setting')"
    @hidden="resetForm"
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
              @blur="$v.form.SessionTimeout.$touch()"
              @focus="$v.form.SessionTimeout.$reset()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.SessionTimeout.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="!$v.form.SessionTimeout.numeric">
                {{ $t('global.form.invalidFormat') }}
              </template>
              <template v-if="!$v.form.SessionTimeout.between">
                {{
                  $t('global.form.fieldBetween', {
                    min: 30,
                    max: 86400,
                  })
                }}
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
import { required, numeric, between } from 'vuelidate/lib/validators';

export default {
  name: 'ModalSessionSetting',
  mixins: [VuelidateMixin, BVToastMixin],
  data() {
    return {
      form: {
        SessionTimeout: 0,
      },
    };
  },
  // @ts-ignore
  validations() {
    return {
      form: {
        SessionTimeout: {
          required,
          numeric,
          between: between(30, 86400),
        },
      },
    };
  },
  mounted() {
    this.$$store.dispatch('sessions/getSessionTimeout').then(() => {
      this.form.SessionTimeout = this.$$store.getters[
        'sessions/sessionTimeout'
      ];
    });
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
    resetForm() {
      this.form.SessionTimeout = this.$$store.getters[
        'sessions/sessionTimeout'
      ];
      this.$v.$reset();
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
