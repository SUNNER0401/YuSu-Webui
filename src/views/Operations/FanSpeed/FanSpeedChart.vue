<template>
  <div
    ref="fanSpeedChart"
    class="charts"
    style="width: 100%; height: 200px"
  ></div>
</template>

<script lang="ts">
import * as echarts from 'echarts';

export default {
  name: 'FanSpeedChart',
  props: {
    fanSpeeds: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      interval: '',
    };
  },
  computed: {
    fanNameList(): string[] {
      let fannameList = Object.keys(this.fanSpeeds);
      return fannameList;
    },
    fanSpeedList(): unknown[] {
      let fanSpeedList = Object.values(this.fanSpeeds);
      return fanSpeedList;
    },
  },
  mounted() {
    var SpeedChart = echarts.init(this.$refs.fanSpeedChart);
    this.interval = setInterval(() => {
      SpeedChart.setOption({
        title: {
          text: this.$t('pageFanSpeed.chart.title.text'),
          subtext: this.$t('pageFanSpeed.chart.title.subtext'),
        },
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          axisTick: { show: false },
          data: this.fanNameList,
          axisLabel: {
            textStyle: {
              fontSize: 12,
            },
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            show: true,
            interval: 'auto',
            formatter: '{value} RPM',
          },
          min: () => 0,
          max: () => 20000,
          show: true,
        },
        series: [
          {
            name: this.$t('pageFanSpeed.chart.fanSpeed'),
            type: 'bar',
            data: this.fanSpeedList,
            itemStyle: {
              color: 'green',
            },
            label: {
              show: this.fanSpeedList[0] != 0 ? true : false,
              position: 'top',
              formatter: '{c} RPM',
            },
            barWidth: '0%',
          },
        ],
      });
    }, 2000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
};
</script>
