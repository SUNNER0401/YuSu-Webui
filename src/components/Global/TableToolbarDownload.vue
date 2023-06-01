<template>
  <b-button
    class="d-flex align-items-center"
    variant="primary"
    :download="download"
    :href="href"
  >
    {{ $t('global.action.download') }}
  </b-button>
</template>

<script>
export default {
  name: 'TableToolbarDownload',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    fileName: {
      type: String,
      default: 'data',
    },
    selectRows: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    dataForExport() {
      return JSON.stringify(this.data);
    },
    download() {
      return `${this.fileName}.json`;
    },
    href() {
      return `data:text/json;charset=utf-8,${this.dataForExport}`;
    },
  },
};
</script>

<style></style>
