<template>
  <div ref="dynamic-chart" style="width: 1000px; height: 500px"></div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import * as echarts from 'echarts';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  mixins: [DataFormatterMixin],
  props: {
    sensorsname: {
      type: String as PropType<string>,
      required: true,
    },
    type: {
      type: String as PropType<string>,
      required: true,
    },
    memberid: {
      type: String as PropType<string>,
      required: true,
    },
    units: {
      type: String as PropType<string>,
      required: true,
    },
    lowercaution: {
      required: true,
    },
    uppercaution: {
      required: true,
    },
    lowercritical: {
      required: true,
    },
    uppercritical: {
      required: true,
    },
    currentvalue: {
      required: true,
    },
  },
  data() {
    return {
      chart: null,
      option: null,
      currentTime: 0,
      currentDataArray: [this.currentvalue, 1, 0],
      WebSocket: null,
    };
  },
  mounted() {
    this.chart = echarts.init(this.$refs['dynamic-chart'] as HTMLElement);
    this.setupChart();
    this.linkSocket();
    setInterval(this.fetchData, 5000);
    this.sendChartBoxToParent();
  },
  beforeDestroy() {
    this.WebSocket.close();
  },
  methods: {
    setupChart() {
      let lowercritical = this.lowercritical ? this.lowercritical : 0;
      let uppercritical = this.uppercritical ? this.uppercritical : 0;
      let lowercaution = this.lowercaution ? this.lowercaution : 0;
      let uppercaution = this.uppercaution ? this.uppercaution : 0;
      let ymax = Math.ceil(
        Math.max(lowercritical, uppercritical, lowercaution, uppercaution)
      );
      this.option = {
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
          name: 'units（' + this.unitFormatter(this.units) + '）',
          max: ymax,
        },
        series: [
          {
            type: 'line',
            data: [this.currentvalue ? this.currentvalue : 0],
            smooth: true,
            markLine: {
              animation: false,
              data: [
                {
                  yAxis: lowercritical,
                  lineStyle: {
                    color: 'red',
                  },
                  label: {
                    formatter: 'Lower Critical',
                  },
                },
                {
                  yAxis: uppercritical,
                  lineStyle: {
                    color: 'red',
                  },
                  label: {
                    formatter: 'Upper Critical',
                  },
                },
                {
                  yAxis: uppercaution,
                  lineStyle: {
                    color: '#EBEF18',
                  },
                  label: {
                    formatter: 'Upper Caution',
                  },
                },
                {
                  yAxis: lowercaution,
                  lineStyle: {
                    color: '#EBEF18',
                  },
                  label: {
                    formatter: 'Lower Caution',
                  },
                },
              ],
            },
          },
        ],
      };
      this.chart.setOption(this.option, true);
    },

    linkSocket() {
      let ws: WebSocket;
      const data = {
        paths: [
          '/xyz/openbmc_project/sensors/' + this.type + '/' + this.memberid,
        ],
        interfaces: ['xyz.openbmc_project.Sensor.Value'],
      };
      const socketDisabled =
        process.env.VUE_APP_SUBSCRIBE_SOCKET_DISABLED === 'true' ? true : false;
      if (socketDisabled) return;
      const token = this.$store.getters['authentication/token'];
      ws = new WebSocket(`wss://${window.location.host}/subscribe`, [token]);
      this.WebSocket = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify(data));
      };
      ws.onerror = (event) => {
        console.error(event);
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (this.currentDataArray[2] === 0) {
          this.currentDataArray[0] = 0;
          this.currentDataArray[1] = 0;
          this.currentDataArray[2] = 1;
        }
        this.currentDataArray[0] += data.properties.Value;
        this.currentDataArray[1]++;
      };
    },

    fetchData() {
      let currentData = this.currentDataArray[0] / this.currentDataArray[1];
      this.currentDataArray[0] = currentData;
      this.currentDataArray[1] = 1;
      this.currentDataArray[2] = 0;
      this.option.series[0].data.push(currentData);
      this.currentTime = this.currentTime + 5;
      this.option.xAxis.data.push(this.currentTime);
      this.option.yAxis.max = Math.max(
        Math.ceil(currentData),
        this.option.yAxis.max
      );
      if (this.option.series[0].data.length > 60) {
        this.option.xAxis.data.shift();
        this.option.series[0].data.shift();
      }
      this.chart.setOption(this.option, true);
    },
    sendChartBoxToParent() {
      this.$emit('send-chart-box', this.chart);
    },
  },
};
</script>
