<template>
  <div>
    <!-- modal-remote-setting -->
    <b-modal
      id="modal-remote-setting"
      :ok-title="$t('global.action.confirm')"
      :cancel-title="$t('global.action.cancel')"
      no-close-on-esc
      no-close-on-backdrop
      @ok="onok"
      @cancel="oncancel"
    >
      <template #modal-header>
        <template v-if="!remoteAddress">{{
          $t('pageAlarmSetting.remoteServer.modal.header1')
        }}</template>
        <template v-else>{{
          $t('pageAlarmSetting.remoteServer.modal.header2')
        }}</template>
      </template>
      <div>
        <b-form @submit.stop.prevent="submitForm">
          <b-form-group
            :label="$t('pageAlarmSetting.remoteServer.modal.address')"
          >
            <b-form-text id="password-help-block">
              {{ $t('pageAlarmSetting.remoteServer.modal.formText1') }}
            </b-form-text>
            <b-form-input
              id="text-address"
              v-model="form.Address"
              aria-describedby="password-help-block"
              :state="getValidationState($v.form.Address)"
              @blur="$v.form.Address.$touch()"
              @focus="$v.form.Address.$reset()"
            ></b-form-input>
            <b-form-invalid-feedback>
              <div v-if="!$v.form.Address.required">
                {{ $t('global.form.fieldRequired') }}
              </div>
              <div v-if="!$v.form.Address.ipAddress">
                {{ $t('pageAlarmSetting.remoteServer.modal.invalidfeedback1') }}
              </div>
            </b-form-invalid-feedback>
          </b-form-group>
          <b-form-group :label="$t('pageAlarmSetting.remoteServer.modal.port')">
            <b-form-text id="password-help-block">
              {{ $t('pageAlarmSetting.remoteServer.modal.formText2') }}
            </b-form-text>
            <b-form-input
              id="text-port"
              v-model="form.Port"
              number
              aria-describedby="password-help-block"
              :state="getValidationState($v.form.Port)"
              @blur="$v.form.Port.$touch()"
              @focus="$v.form.Port.$reset()"
            ></b-form-input>
            <b-form-invalid-feedback>
              <div v-if="!$v.form.Port.required">
                {{ $t('global.form.fieldRequired') }}
              </div>
              <div v-if="!$v.form.Port.between">
                {{ $t('pageAlarmSetting.remoteServer.modal.invalidfeedback2') }}
              </div>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-form>
      </div>
    </b-modal>
  </div>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { required, ipAddress, between } from 'vuelidate/lib/validators';

export default {
  name: 'ModalRemoteSetting',
  mixins: [VuelidateMixin],
  props: {
    remoteAddress: {
      type: String,
      default: null,
    },
    remotePort: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      form: {
        Address: this.$store.getters['alarmSetting/remoteServer'].Address,
        Port: this.$store.getters['alarmSetting/remoteServer'].Port,
      },
    };
  },
  validations() {
    return {
      form: {
        Address: {
          required,
          ipAddress,
        },
        Port: {
          required,
          between: between(1, 65535),
        },
      },
    };
  },
  async created() {
    await this.$store.dispatch('alarmSetting/getRemoteServer');
    this.$root.$emit('update-remote-server', this.updateServer);
    this.$root.$emit('$v-reset', this.$v.$reset);
  },
  methods: {
    submitForm(bvModalEvt) {
      this.$v.$touch();
      if (this.$v.$invalid) {
        bvModalEvt.preventDefault();
        return;
      }
      this.$store.dispatch('alarmSetting/setRemoteAddress', this.form);
      this.$store.dispatch('alarmSetting/setRemotePort', this.form);
    },
    onok(bvModalEvt) {
      this.submitForm(bvModalEvt);
    },
    oncancel() {
      this.$bvModal.hide('modal-remote-setting');
      this.updateServer();
    },
    updateServer() {
      this.form.Address = this.$store.getters[
        'alarmSetting/remoteServer'
      ].Address;
      this.form.Port = this.$store.getters['alarmSetting/remoteServer'].Port;
    },
  },
};
</script>
