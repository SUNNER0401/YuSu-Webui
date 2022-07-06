<template>
  <b-row>
    <b-col xl="10">
      <!-- Operation in progress alert -->
      <alert v-if="isOperationInProgress" variant="info" class="mb-5">
        <p>
          {{ $t('pageFirmware.alert.operationInProgress') }}
        </p>
      </alert>
      <!-- Power off server warning alert -->
      <alert
        v-else-if="isServerPowerOffRequired && !isServerOff"
        variant="warning"
        class="mb-5"
      >
        <p class="mb-0">
          {{ $t('pageFirmware.alert.serverMustBePoweredOffTo') }}
        </p>
        <ul class="m-0">
          <li>
            {{ $t('pageFirmware.alert.switchRunningAndBackupImages') }}
          </li>
          <li>
            {{ $t('pageFirmware.alert.updateFirmware') }}
          </li>
        </ul>
        <template #action>
          <b-link to="/operations/server-power-operations">
            {{ $t('pageFirmware.alert.viewServerPowerOperations') }}
          </b-link>
        </template>
      </alert>
    </b-col>
  </b-row>
</template>

<script>
import Alert from '@/components/Global/Alert';

export default {
  components: { Alert },
  props: {
    isServerOff: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
      env: process.env,
    };
  },
  computed: {
    isOperationInProgress() {
      return this.$store.getters['controls/isOperationInProgress'];
    },
  },
};
</script>
