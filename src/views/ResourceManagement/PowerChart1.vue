<template>
  <div
    ref="powerChart1"
    class="charts"
    style="width: 100%; height: 400px"
  ></div>
</template>

<script lang="ts">
import * as echarts from 'echarts';

export default {
  name: 'PowerChart1',
  props: {
    powerConsumptionValue: {
      required: true,
      type: Number,
    },
  },
  data() {
    return {
      dataZoom: {
        start: 0,
        end: 100,
      },
      timer: null,
    };
  },
  computed: {
    // current power chart data.
    powerChartData1() {
      return this.$store.getters['powerControl/powerChartData1'];
    },
    ReadingRangeMax() {
      return this.$store.getters['powerControl/ReadingRangeMax'];
    },
  },
  async mounted() {
    const getRealTimeData = new Promise<void>((resolve) => {
      this.$root.$on('getRealTimeData-complete', () => resolve());
    });
    await Promise.all([getRealTimeData]);
    var powerChart = echarts.init(this.$refs.powerChart1);
    let _this = this;

    var setPowerChart = function () {
      // This setTimeout is set to filter initial powerConsumptionValue value 0.
      setTimeout(() => {
        if (powerChart.getOption()) {
          [_this.dataZoom.start, _this.dataZoom.end] = [
            (powerChart.getOption().option as any).dataZoom[0].start,
            (powerChart.getOption().option as any).dataZoom[0].end,
          ];
        }
        let option = {
          backgroundColor: '',
          tooltip: {
            trigger: 'axis',
            position: function (pt: any[]) {
              return [pt[0], '10%'];
            },
          },
          title: {
            left: 'center',
            text: _this.$t('pagePower.table.title1'),
          },
          xAxis: {
            name: _this.$t('pagePower.table.time'),
            type: 'time',
            boundaryGap: false,
          },
          yAxis: {
            name: _this.$t('pagePower.table.power'),
            type: 'value',
            axisLabel: {
              show: true,
              interval: 'auto',
            },
            splitLine: {
              show: false,
            },
            min: () => 0,
            max: () => _this.ReadingRangeMax,
            show: true,
            boundaryGap: false,
          },
          dataZoom: [
            {
              type: 'inside',
              start: _this.dataZoom.start,
              end: _this.dataZoom.end,
            },
            {
              type: 'slider',
              start: 0,
              end: 20,
            },
          ],
          series: [
            {
              name: 'Fake Data',
              type: 'line',
              smooth: true,
              symbol: 'none',
              areaStyle: {},
              data: _this.powerChartData1,
            },
          ],
        };
        powerChart.setOption(option, {
          notMerge: false,
          lazyUpdate: true,
          silent: false,
        });
      }, 1000);
      return setPowerChart;
    };

    // Refresh the chart per 5 seconds
    this.timer = setInterval(setPowerChart(), 2000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>
