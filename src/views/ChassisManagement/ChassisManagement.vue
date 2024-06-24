<!-- eslint-disable vue/require-v-for-key -->
<template>
  <b-container fluid>
    <page-title />
    <page-section
      :section-title="$t('pageOverview.systemInformation')"
      class="mb-1"
    >
      <b-row>
        <div v-for="(value, key) in ChassisItems" :key="key">
          <chassis-item
            :data="value"
            :title="key"
            class="m-0 p-1"
          ></chassis-item>
        </div>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import ChassisItem from './ChassisItem.vue';

export default {
  name: 'ChassisManagement',
  components: {
    PageSection,
    PageTitle,
    ChassisItem,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    clearInterval(this.timer);
    this.hideLoader();
    next();
  },
  data() {
    return {};
  },
  computed: {
    ChassisItems() {
      // example
      // return {
      //   nihao: {
      //     id: '1',
      //     model: 18,
      //     serialNumber: 'nan',
      //     health: 'yes',
      //   },
      //   nihao2: {
      //     id: '1',
      //     model: 18,
      //     serialNumber: 'nan',
      //     health: 'yes',
      //   },
      // };
      return this.$store.getters['chassisManage/chassisManageValue'];
    },
  },
  created() {
    this.startLoader();
    this.timer = setInterval(() => {
      this.$store.dispatch('chassisManage/getChassisManageValue');
    }, 10000);
  },
};
</script>
