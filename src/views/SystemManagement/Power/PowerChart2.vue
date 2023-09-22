<template>
  <div
    ref="powerChart2"
    class="charts"
    style="width: 100%; height: 400px"
  ></div>
</template>

<script lang="ts">
import * as echarts from 'echarts';

class DataSet {
  xData: any;
  yData: { averagePower: any[]; maxPower: any[] };
  constructor(historyInfo: any[]) {
    this.xData = [];
    this.yData = {
      averagePower: [],
      maxPower: [],
    };
    historyInfo.forEach((item) => {
      // Format xData
      let date = item.time.split(' ')[0];
      let time = item.time.split(' ')[1];
      this.xData.push(`${date}\n${time}`);
      this.yData.averagePower.push(item.averagePower);
      this.yData.maxPower.push(item.maxPower);
    });
  }
}

export default {
  name: 'PowerChart2',
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
    };
  },
  computed: {
    historyInfo() {
      return this.$store.getters['powerControl/historyInfo'];
    },
  },
  async mounted() {
    const getHistoryInfo = new Promise<void>((resolve) => {
      this.$root.$on('getHistoryInfo-complete', () => resolve());
    });
    await Promise.all([getHistoryInfo]);
    var powerChart = echarts.init(this.$refs.powerChart2);
    let _this = this;
    let dataSet = new DataSet(this.historyInfo);
    var setPowerChart = function () {
      let option = {
        backgroundColor: '',
        title: {
          left: 'center',
          text: _this.$t('pagePower.table.title2'),
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          borderWidth: 0,
          top: 110,
          bottom: 95,
          textStyle: {
            color: '#fff',
          },
        },
        legend: {
          x: '46%',
          top: '11%',
          left: 'center',
          textStyle: {
            color: '#',
          },
          data: [
            _this.$t('pagePower.table.averagePower'),
            _this.$t('pagePower.table.maxPower'),
          ],
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            data: dataSet.xData,
          },
        ],
        yAxis: [
          {
            type: 'value',
            splitLine: {
              show: false,
            },
          },
        ],
        dataZoom: [
          {
            show: true,
            height: 30,
            xAxisIndex: [0],
            bottom: 30,
            start: 10,
            end: 80,
            handleIcon:
              'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
            handleSize: '110%',
            handleStyle: {
              color: '#5B3AAE',
            },
            textStyle: {
              color: 'rgba(204,187,225,0.5)',
            },
            fillerColor: 'rgba(67,55,160,0.4)',
            borderColor: 'rgba(204,187,225,0.5)',
          },
          {
            type: 'inside',
            show: true,
            height: 15,
            start: 1,
            end: 35,
          },
        ],
        series: [
          {
            name: _this.$t('pagePower.table.averagePower'),
            type: 'line',
            symbolSize: 10,
            symbol: 'circle',
            itemStyle: {
              color: '#6f7de3',
            },
            markPoint: {
              label: {
                normal: {
                  textStyle: {
                    color: '#fff',
                  },
                },
              },
              data: [
                {
                  type: 'max',
                  name: 'maxValue',
                },
              ],
            },
            data: dataSet.yData.averagePower,
          },
          {
            name: _this.$t('pagePower.table.maxPower'),
            type: 'line',
            symbolSize: 10,
            symbol: 'circle',
            itemStyle: {
              color: '#c257F6',
            },
            markPoint: {
              label: {
                normal: {
                  textStyle: {
                    color: '#fff',
                  },
                },
              },
              data: [
                {
                  type: 'max',
                  name: 'maxValue',
                },
              ],
            },
            data: dataSet.yData.maxPower,
          },
        ],
      };
      powerChart.setOption(option);
    };
    setPowerChart();
    this.timer = setInterval(() => {
      setPowerChart();
      powerChart.resize();
    }, 2000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>
