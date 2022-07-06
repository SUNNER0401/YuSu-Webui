<template>
  <div>
    <b-modal
      id="modal-update-firmware"
      :title="$t('pageFirmware.sectionTitleUpdateFirmware')"
      :ok-title="$t('pageFirmware.form.updateFirmware.startUpdate')"
      :cancel-title="$t('global.action.cancel')"
      @ok="$emit('ok')"
    >
      <template v-if="isSingleFileUploadEnabled">
        <p>
          {{ $t('pageFirmware.modal.updateFirmwareInfo') }}
        </p>
        <p>
          {{
            $t('pageFirmware.modal.updateFirmwareInfo2', {
              running: runningBmcVersion,
            })
          }}
        </p>
        <p class="m-0">
          {{ $t('pageFirmware.modal.updateFirmwareInfo3') }}
        </p>
      </template>
      <template v-else>
        {{ $t('pageFirmware.modal.updateFirmwareInfoDefault') }}
      </template>
    </b-modal>
    <!-- Update firmware modal -->
    <b-modal
      id="modal-update-firmware-bios-progress"
      :title="updatingTitle"
      hide-footer
      hide-header-close
      no-close-on-backdrop
      no-close-on-esc
    >
      <b-progress :max="updateProgressMax" class="mt-3">
        <b-progress-bar
          :value="updateProgress"
          variant="primary"
          animated
          show-value
          :precision="1"
          :label="`${((updateProgress / updateProgressMax) * 100).toFixed(0)}%`"
        >
        </b-progress-bar>
      </b-progress>
      <div style="float: left">
        <p>{{ complete }}: {{ updateProgress }}%</p>
      </div>
      <div style="float: right">
        <p>{{ Activation }}</p>
      </div>
    </b-modal>
    <b-modal
      id="modal-update-firmware-bmc-progress"
      :title="$t('pageFirmware.modal.bmcUpdatingTitle')"
      no-close-on-backdrop
      no-close-on-esc
      hide-footer
      hide-header-close
    >
      <p>{{ $t('pageFirmware.modal.bmcUpdatingMessage') }}</p>
      <b-progress :max="updateProgressMax" class="mt-3">
        <b-progress-bar
          :value="100"
          variant="danger"
          animated
          :label="$t('pageFirmware.modal.updating').split(':')[0]"
        >
        </b-progress-bar>
      </b-progress>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      updateProgressMax: 100,
    };
  },
  computed: {
    updatingTitle() {
      let updateTitle = {
        Updating: this.$t('pageFirmware.modal.updating'),
        updatingId: this.$store.state.firmware.updateFirmware.id,
        type: this.$t('pageFirmware.modal.type'),
        firmtype: this.$store.state.firmware.updateFirmware.type,
      };
      if (updateTitle.updatingId)
        return (
          updateTitle.Updating +
          updateTitle.updatingId +
          ' ' +
          updateTitle.type +
          updateTitle.firmtype
        );
      else return updateTitle.Updating.split(':')[0];
    },
    complete() {
      return this.$t('pageFirmware.modal.complete');
    },
    runningBmc() {
      return this.$store.getters['firmware/activeBmcFirmware'];
    },
    runningBmcVersion() {
      return this.runningBmc?.version || '--';
    },
    isSingleFileUploadEnabled() {
      return this.$store.getters['firmware/isSingleFileUploadEnabled'];
    },
    updateProgress() {
      return this.$store.state.firmware.updateProgress;
    },
    Activation() {
      if (this.updateProgress >= 0 && this.updateProgress < 20)
        return this.$t('pageFirmware.modal.state.uploading');
      if (this.updateProgress >= 20 && this.updateProgress < 40)
        return this.$t('pageFirmware.modal.state.startBurning');
      if (this.updateProgress >= 40 && this.updateProgress < 90)
        return this.$t('pageFirmware.modal.state.loadBios');
      if (this.updateProgress >= 90 && this.updateProgress < 100)
        return this.$t('pageFirmware.modal.state.burningBios');
      if (this.updateProgress === 100)
        return this.$t('pageFirmware.modal.state.success');
      else return 'error';
    },
  },
};
</script>
