<template>
  <div
    ref="fanSpeedChart"
    class="charts"
    style="width: 100%; height: 200px"
  ></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'SpeedChart',
  props: {
    fanSpeeds: {
      required: true,
      type: Object,
    },
  },
  computed: {
    fanNameList() {
      let fannameList = [];
      for (let fanname in this.fanSpeeds) {
        fannameList.push(fanname);
      }
      return fannameList;
    },
    fanSpeedList() {
      let fanspeedList = [];
      for (let fanname in this.fanSpeeds) {
        let fanSpeed = Number(
          this.fanSpeeds[fanname].replace('%', '')
        ).toFixed();
        fanspeedList.push(fanSpeed);
      }
      return fanspeedList;
    },
  },
  mounted() {
    var SpeedChart = echarts.init(this.$refs.fanSpeedChart);
    setInterval(() => {
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
            formatter: '{value}%',
          },
          min: () => 0,
          max: () => 100,
          show: true,
        },
        series: [
          {
            name: 'fanSpeed',
            type: 'bar',
            data: this.fanSpeedList,
            itemStyle: {
              color: 'green',
            },
            label: {
              show: this.fanSpeedList[0] != 0 ? true : false,
              position: 'outside',
              formatter: '{c}%',
            },
            barWidth: '0%',
          },
        ],
      });
    }, 2000);
  },
};
</script>
