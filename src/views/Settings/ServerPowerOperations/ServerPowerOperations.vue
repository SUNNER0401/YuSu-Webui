<template>
  <b-container fluid>
    <page-title />
    <b-row class="mb-4">
      <b-col md="8" xl="6">
        <page-section
          :section-title="$t('pageServerPowerOperations.currentStatus')"
        >
          <b-row>
            <b-col>
              <dl>
                <dt>{{ $t('pageServerPowerOperations.serverStatus') }}</dt>
                <dd
                  v-if="serverStatus === 'on'"
                  data-test-id="powerServerOps-text-hostStatus"
                >
                  {{ $t('global.status.on') }}
                </dd>
                <dd
                  v-else-if="serverStatus === 'off'"
                  data-test-id="powerServerOps-text-hostStatus"
                >
                  {{ $t('global.status.off') }}
                </dd>
                <dd v-else>
                  {{ $t('global.status.notAvailable') }}
                </dd>
              </dl>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <dl>
                <dt>
                  {{ $t('pageServerPowerOperations.lastPowerOperation') }}
                </dt>
                <dd
                  v-if="lastPowerOperationTime"
                  data-test-id="powerServerOps-text-lastPowerOp"
                >
                  {{ lastPowerOperationTime | formatDate }}
                  {{ lastPowerOperationTime | formatTime }}
                </dd>
                <dd v-else>--</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-if="hasBootSourceOptions" sm="8" md="6" xl="4">
        <page-section
          :section-title="$t('pageServerPowerOperations.serverBootSettings')"
        >
          <boot-settings />
        </page-section>
      </b-col>
      <b-col sm="8" md="6" xl="7">
        <page-section
          :section-title="$t('pageServerPowerOperations.operations')"
        >
          <alert :show="oneTimeBootEnabled" variant="warning">
            {{ $t('pageServerPowerOperations.oneTimeBootWarning') }}
          </alert>
          <template v-if="isOperationInProgress">
            <alert variant="info">
              {{ $t('pageServerPowerOperations.operationInProgress') }}
            </alert>
          </template>
          <template v-else-if="serverStatus === 'off'">
            <b-button
              variant="primary"
              data-test-id="serverPowerOperations-button-powerOn"
              @click="powerOn"
            >
              {{ $t('pageServerPowerOperations.powerOn') }}
            </b-button>
          </template>
          <template v-else-if="serverStatus === 'unreachable'">
            <p>{{ serverStatus }}</p>
          </template>
          <template v-else>
            <!-- Reboot server options -->
            <b-form novalidate class="mb-5" @submit.prevent="rebootServer">
              <p>{{ $t('pageServerPowerOperations.immediateReboot') }}</p>
              <b-button
                variant="primary"
                type="submit"
                data-test-id="serverPowerOperations-button-reboot"
              >
                {{ $t('pageServerPowerOperations.reboot') }}
              </b-button>
            </b-form>
            <!-- Shutdown server options -->
            <b-form novalidate @submit.prevent="shutdownServer">
              <p>{{ $t('pageServerPowerOperations.immediateShutdown') }}</p>
              <b-button
                variant="primary"
                type="submit"
                data-test-id="serverPowerOperations-button-shutDown"
              >
                {{ $t('pageServerPowerOperations.shutDown') }}
              </b-button>
            </b-form>
          </template>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import BootSettings from './BootSettings';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import Alert from '@/components/Global/Alert';

export default {
  name: 'ServerPowerOperations',
  components: { PageTitle, PageSection, BootSettings, Alert },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to: any, from: any, next: () => void) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      form: {
        rebootOption: 'immediate',
        shutdownOption: 'immediate',
      },
    };
  },
  computed: {
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    isOperationInProgress() {
      return this.$store.getters['controls/isOperationInProgress'];
    },
    lastPowerOperationTime() {
      return this.$store.getters['controls/lastPowerOperationTime'];
    },
    oneTimeBootEnabled() {
      return this.$store.getters['serverBootSettings/overrideEnabled'];
    },
    hasBootSourceOptions() {
      let bootOptions = this.$store.getters[
        'serverBootSettings/bootSourceOptions'
      ];
      return bootOptions.length !== 0;
    },
  },
  created() {
    this.startLoader();
    const bootSettingsPromise = new Promise<void>((resolve) => {
      this.$root.$on('server-power-operations-boot-settings-complete', () =>
        resolve()
      );
    });
    Promise.all([
      this.$store.dispatch('serverBootSettings/getBootSettings'),
      this.$store.dispatch('controls/getLastPowerOperationTime'),
      bootSettingsPromise,
    ]).finally(() => this.endLoader());
  },
  methods: {
    powerOn() {
      this.$store.dispatch('controls/serverPowerOn');
    },
    rebootServer() {
      const modalMessage = this.$t(
        'pageServerPowerOperations.modal.confirmRebootMessage'
      );
      const modalOptions = {
        title: this.$t('pageServerPowerOperations.modal.confirmRebootTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
      };

      if (this.form.rebootOption === 'orderly') {
        this.$bvModal
          .msgBoxConfirm(modalMessage, modalOptions)
          .then((confirmed: boolean) => {
            if (confirmed) this.$store.dispatch('controls/serverSoftReboot');
          });
      } else if (this.form.rebootOption === 'immediate') {
        this.$bvModal
          .msgBoxConfirm(modalMessage, modalOptions)
          .then((confirmed: boolean) => {
            if (confirmed) this.$store.dispatch('controls/serverHardReboot');
          });
      }
    },
    shutdownServer() {
      const modalMessage = this.$t(
        'pageServerPowerOperations.modal.confirmShutdownMessage'
      );
      const modalOptions = {
        title: this.$t('pageServerPowerOperations.modal.confirmShutdownTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
      };

      if (this.form.shutdownOption === 'orderly') {
        this.$bvModal
          .msgBoxConfirm(modalMessage, modalOptions)
          .then((confirmed: boolean) => {
            if (confirmed) this.$store.dispatch('controls/serverSoftPowerOff');
          });
      }
      if (this.form.shutdownOption === 'immediate') {
        this.$bvModal
          .msgBoxConfirm(modalMessage, modalOptions)
          .then((confirmed: boolean) => {
            if (confirmed) this.$store.dispatch('controls/serverHardPowerOff');
          });
      }
    },
  },
};
</script>
