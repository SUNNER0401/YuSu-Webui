<template>
  <div
    ref="historyChart"
    class="charts"
    style="width: 100%; height: 400px"
  ></div>
</template>

<script lang="ts">
import * as echarts from 'echarts';

export default {
  name: 'PerformanceMonitorHistoryChart',
  props: {
    hardwareName: {
      type: String,
      default: 'hardware',
    },
    historyData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      timer: null,
      historyChart: '',
    };
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  mounted() {
    this.historyChart = echarts.init(this.$refs.historyChart);
    let _this = this;
    let title = '';
    switch (this.hardwareName) {
      case 'CPU':
        title = 'CPU';
        break;
      case 'Memory':
        title = this.$t('pagePerformanceMonitor.Memory');
        break;
      case 'Disk':
        title = this.$t('pagePerformanceMonitor.Disk');
        break;
      case 'NetInterface':
        title = this.$t('pagePerformanceMonitor.NetInterface');
        break;
    }
    let options = {
      title: {
        text: title,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{a}: </br> {b} : {c}%',
      },
      xAxis: [
        {
          type: 'category',
          data: _this.historyData.map(({ dateTime }: { dateTime: string }) => {
            let date = dateTime.split(' ')[0];
            let time = dateTime.split(' ')[1];
            return `${date}\n${time}`;
          }),
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: `${_this.$t('pagePerformanceMonitor.usage')}(%)`,
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#DDD',
            },
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#333',
            },
          },
          splitArea: {
            show: false,
          },
          max: 100,
        },
      ],
      series: [
        {
          name: _this.$t('pagePerformanceMonitor.usage'),
          type: 'line',
          data: _this.historyData.map(({ usage }: { usage: string }) =>
            parseInt(usage.split('%')[0])
          ),
          lineStyle: {
            normal: {
              width: 8,
              color: {
                type: 'linear',

                colorStops: [
                  {
                    offset: 0,
                    color: '#A9F387',
                  },
                  {
                    offset: 1,
                    color: '#48D8BF',
                  },
                ],
                globalCoord: false,
              },
              shadowColor: 'rgba(72,216,191, 0.3)',
              shadowBlur: 10,
              shadowOffsetY: 20,
            },
          },
          itemStyle: {
            normal: {
              color: '#fff',
              borderWidth: 10,
              borderColor: '#A9F387',
            },
          },
          smooth: true,
        },
      ],
    };
    this.historyChart.setOption(options, {
      notMerge: false,
      lazyUpdate: true,
      silent: false,
    });
    this.timer = setInterval(() => {
      this.historyChart.resize();
    }, 500);
  },
};
</script>

<style></style>
