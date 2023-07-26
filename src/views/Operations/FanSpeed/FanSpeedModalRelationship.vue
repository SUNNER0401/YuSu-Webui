<template>
  <b-modal
    :id="`modal-fan-speed-relationship-${zoneInfo.ZoneName}`"
    :title="$t('pageFanSpeed.zoneRelationship')"
    ok-only
  >
    <p v-for="(tachName, pwmName) in zoneInfo.FanInfo" :key="pwmName">
      {{ pwmName }} -> {{ tachName }}
    </p>
  </b-modal>
</template>

<script lang="ts">
export default {
  props: {
    zoneInfo: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
};
</script>
