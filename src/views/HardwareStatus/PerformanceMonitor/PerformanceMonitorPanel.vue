<template>
  <div ref="Panel" class="charts" style="width: 100%; height: 400px"></div>
</template>

<script lang="ts">
import * as echarts from 'echarts';

export default {
  name: 'PerformanceMonitorPanel',
  props: {
    hardwareName: {
      type: String,
      default: 'hardware',
    },
    currentData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      timer: '',
      cpuPanelChart: '',
    };
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  mounted() {
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
    const _this = this;
    this.cpuPanelChart = echarts.init(this.$refs.Panel);
    this.timer = setInterval(() => {
      var dataArr = parseInt(this.currentData.usage.split('%')[0]);
      var colorSet = {
        color: '#468EFD',
      };

      let options = {
        tooltip: {
          formatter: '{b} : {c}%',
        },

        series: [
          {
            name: _this.$t('pagePerformanceMonitor.usage'),
            type: 'gauge',
            radius: '40%',

            splitNumber: 10,
            axisLine: {
              lineStyle: {
                color: [
                  [dataArr / 100, colorSet.color],
                  [1, '#111F42'],
                ],
                width: 8,
              },
            },
            axisLabel: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            itemStyle: {
              show: false,
            },
            detail: {
              formatter: function (value: number) {
                if (value !== 0) {
                  var num = Math.round(value);
                  return num.toFixed(0) + '%';
                } else {
                  return 0;
                }
              },
              offsetCenter: [0, 82],
              textStyle: {
                padding: [0, 0, 0, 0],
                fontSize: 18,
                fontWeight: '700',
                color: colorSet.color,
              },
            },
            title: {
              show: true,
              offsetCenter: [0, 56], // x, y，px
              textStyle: {
                fontSize: 14,
                fontWeight: 400,
                fontFamily: 'PingFangSC',
              },
            },
            data: [
              {
                name: title + ' ' + _this.$t('pagePerformanceMonitor.usage'),
                value: dataArr,
              },
            ],
            pointer: {
              show: true,
              length: '75%',
              radius: '20%',
              width: 10,
            },
            animationDuration: 4000,
          },
          {
            name: 'External scale',
            type: 'gauge',
            radius: '50%',
            min: 0,
            max: 100,
            splitNumber: 10,
            startAngle: 225,
            endAngle: -45,
            axisLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: [[1, 'rgba(0,0,0,0)']],
              },
            },
            axisLabel: {
              show: true,
              color: '#4d5bd1',
              distance: 25,
              formatter: function (v: string) {
                switch (v + '') {
                  case '0':
                    return '0';
                  case '10':
                    return '10';
                  case '20':
                    return '20';
                  case '30':
                    return '30';
                  case '40':
                    return '40';
                  case '50':
                    return '50';
                  case '60':
                    return '60';
                  case '70':
                    return '70';
                  case '80':
                    return '80';
                  case '90':
                    return '90';
                  case '100':
                    return '100';
                }
              },
            },
            axisTick: {
              show: true,
              splitNumber: 7,
              lineStyle: {
                color: colorSet.color,
                width: 1,
              },
              length: -8,
            },
            splitLine: {
              show: true,
              length: -20,
              lineStyle: {
                color: colorSet.color,
              },
            },
            detail: {
              show: false,
            },
            pointer: {
              show: false,
            },
          },
        ],
      };
      this.cpuPanelChart.setOption(options, {
        notMerge: false,
        lazyUpdate: true,
        silent: false,
      });
      this.cpuPanelChart.resize();
    }, 1000);
  },
};
</script>

<style></style>
