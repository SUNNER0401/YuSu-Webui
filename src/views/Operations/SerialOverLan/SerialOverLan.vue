<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <page-title
          class="mb-4"
          :description="$t('pageSerialOverLan.subTitle')"
        />

        <page-section class="mb-0">
          <serial-over-lan-console :is-full-window="false" :element="element" />
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
  // You only can get dom after mounting operation.
  data() {
    return {
      element: null,
    };
  },
  mounted() {
    this.element = document.getElementById('terminal');
  },
};
</script>

<style lang="scss" scoped>
.container-fluid {
  height: 90vh;
}
</style>
