<template>
  <overview-card
    :title="$t('pageOverview.firmwareInformation')"
    :to="`/settings/firmware`"
  >
    <b-row class="mt-3">
      <b-col>
        <dl>
          <dt v-if="BMCVersion">{{ $t('pageOverview.BMCVersion') }}</dt>
          <dd v-if="BMCVersion">{{ dataFormatter(BMCVersion) }}</dd>
          <dt v-if="hostVersion">{{ $t('pageOverview.hostVersion') }}</dt>
          <dd v-if="hostVersion">{{ dataFormatter(hostVersion) }}</dd>
          <dt v-if="PBFVersion">{{ $t('pageOverview.PBFVersion') }}</dt>
          <dd v-if="PBFVersion">{{ dataFormatter(PBFVersion) }}</dd>
          <dt v-if="cpldVersion">{{ $t('pageOverview.cpldVersion') }}</dt>
          <dd v-if="cpldVersion">{{ dataFormatter(cpldVersion) }}</dd>
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
    activeCpldFirmware() {
      return this.$store.getters[`firmware/activeCpldFirmware`];
    },
    cpldVersion() {
      return this.activeCpldFirmware?.version;
    },
    hostFirmware() {
      return this.$store.getters['firmware/activeHostFirmware'];
    },
    hostVersion() {
      return this.hostFirmware?.version;
    },
    PBFVersion() {
      return this.$store.getters['firmware/activeHostPbfFirmware'];
    },
  },
  created() {
    this.$store.dispatch('firmware/getFirmwareInformation').finally(() => {
      this.$root.$emit('overview-firmware-complete');
    });
  },
};
</script>
