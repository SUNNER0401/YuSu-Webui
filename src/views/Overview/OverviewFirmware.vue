<template>
  <overview-card
    :title="$t('pageOverview.firmwareInformation')"
    :to="`/operations/firmware`"
  >
    <b-row class="mt-3">
      <b-col>
        <dl>
          <dt v-if="BMCVersion">{{ $t('pageOverview.BMCVersion') }}</dt>
          <dd v-if="BMCVersion">{{ dataFormatter(BMCVersion) }}</dd>
          <dt v-if="hostVersion">{{ $t('pageOverview.hostVersion') }}</dt>
          <dd v-if="hostVersion">{{ dataFormatter(hostVersion) }}</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'Firmware',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  computed: {
    backupBmcFirmware() {
      return this.$store.getters['firmware/backupBmcFirmware'];
    },
    backupVersion() {
      return this.backupBmcFirmware?.version;
    },
    activeBmcFirmware() {
      return this.$store.getters[`firmware/activeBmcFirmware`];
    },
    BMCVersion() {
      return this.activeBmcFirmware?.version;
    },
    hostFirmware() {
      return this.$store.getters['firmware/activeHostFirmware'];
    },
    hostVersion() {
      return this.hostFirmware?.version;
    },
  },
  created() {
    this.$store.dispatch('firmware/getFirmwareInformation').finally(() => {
      this.$root.$emit('overview-firmware-complete');
    });
  },
};
</script>
