<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <page-title
          class="mb-4"
          :description="$t('pageSerialOverLan.subTitle')"
        />

        <page-section class="mb-0">
          <serial-over-lan-console
            :is-full-window="isFullWindow"
            :element="element"
          />
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import SerialOverLanConsole from './SerialOverLanConsole';

export default {
  name: 'SerialOverLan',
  components: {
    PageSection,
    PageTitle,
    SerialOverLanConsole,
  },
  provide() {
    return {
      setIsFullWindow: this.setIsFullWindow,
    };
  },
  // You only can get dom after mounting operation.
  data() {
    return {
      element: null,
      isFullWindow: false,
    };
  },
  mounted() {
    this.element = document.getElementById('base-container');
  },
  methods: {
    setIsFullWindow(status) {
      this.isFullWindow = status;
    },
  },
};
</script>

<style lang="scss" scoped>
.container-fluid {
  height: 90vh;
}
</style>
