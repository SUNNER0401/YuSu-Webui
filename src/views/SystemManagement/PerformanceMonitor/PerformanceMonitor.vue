<template>
  <b-container fluid>
    <page-title />
    <page-section :section-title="$t('pagePerformanceMonitor.currentStatus')">
      <b-row>
        <b-col
          v-for="(historyData, hardwareName) in hostStatus"
          :key="hardwareName"
          sm="12"
          md="12"
          lg="6"
          xl="3"
        >
          <performance-monitor-panel
            :ref="hardwareName"
            :hardware-name="hardwareName"
            :current-data="historyData[historyData.length - 1]"
          />
        </b-col>
      </b-row>
    </page-section>
    <page-section :section-title="$t('pagePerformanceMonitor.history')">
      <b-row>
        <b-col
          v-for="(historyData, hardwareName) in hostStatus"
          :key="hardwareName"
          sm="12"
          md="12"
          lg="6"
          xl="6"
        >
          <performance-monitor-history-chart
            :hardware-name="hardwareName"
            :history-data="historyData"
          />
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script lang="ts">
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import PerformanceMonitorPanel from './PerformanceMonitorPanel';
import PerformanceMonitorHistoryChart from './PerformanceMonitorHistoryChart';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'PerformanceMonitor',
  components: {
    PageTitle,
    PageSection,
    PerformanceMonitorPanel,
    PerformanceMonitorHistoryChart,
  },
  mixins: [LoadingBarMixin],
  data() {
    return {
      timer: '',
    };
  },
  computed: {
    hostStatus: {
      get() {
        return this.$store.getters['performanceMonitor/hostStatus'];
      },
    },
  },
  mounted() {
    this.startLoader();
    this.timer = setInterval(() => {
      this.$store
        .dispatch('performanceMonitor/getHostStatus')
        .catch(() => {
          clearInterval(this.timer);
          this.$bvModal.msgBoxOk(
            this.$t('pagePerformanceMonitor.msgBox.missHardware')
          );
        })
        .finally(() => {
          this.endLoader();
        });
    }, 2500);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>

<style lang="scss" scoped></style>
