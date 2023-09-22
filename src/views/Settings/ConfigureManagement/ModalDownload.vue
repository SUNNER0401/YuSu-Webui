<template>
  <b-modal
    id="download-preparing"
    :title="$t('pageConfigureManagement.modal.downloadPrepareTitle')"
    no-close-on-backdrop
    no-close-on-esc
    hide-footer
  >
    <b-progress class="mt-3">
      <b-progress-bar
        :value="100"
        variant="danger"
        animated
        :label="
          $t('pageConfigureManagement.modal.downloadPrepareBody').split(':')[0]
        "
      >
      </b-progress-bar>
    </b-progress>
  </b-modal>
</template>

<script>
export default {
  name: 'ModalDownload',
};
</script>

<style></style>
