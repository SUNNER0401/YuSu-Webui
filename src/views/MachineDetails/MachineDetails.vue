<template>
  <b-container fluid>
    <page-title />
    <b-tabs v-model="activeTab">
      <b-tab
        v-for="(machine, key) in machines"
        :key="key"
        :title="machine.title"
      >
        <div>
          <h4>{{ machine.title }}</h4>
          <ul>
            <li>型号: {{ machine.model }}</li>
            <li>序列号: {{ machine.serialNumber }}</li>
            <li>IP地址: {{ machine.ipAddress }}</li>
            <li>健康状态: {{ machine.health }}</li>
            <li>主机名: {{ machine.hostname }}</li>
            <li>连接状态: {{ machine.linkStatus }}</li>
            <li>警告信息: {{ machine.warning }}</li>
            <li>错误信息: {{ machine.error }}</li>
          </ul>
        </div>
      </b-tab>
    </b-tabs>
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
export default {
  name: 'MachinedDetails',
  components: {
    PageTitle,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    clearInterval(this.timer);
    this.hideLoader(); //这个方法在 LoadingBarMixin 中定义
    next();
  },
  data() {
    return {
      activeTab: 0,
      machines: [], //已经将map映射为数据

      //需要打开！！！！
      // return this.$store.getters['multimachine/multimachineValue'];
    };
  },
  created() {
    // 在组件创建时获取机器数据
    this.fetchMachineDetails();
    this.startLoader();

    // 需要打开！！！！
    this.timer = setInterval(() => {
      this.$store.dispatch('multimachine/getMultimachineValue');
    }, 1000);

    // 根据 currentTitle 设置初始 activeTab
    const currentTitle = this.$route.params.currentTitle;
    if (currentTitle) {
      const index = this.machines.findIndex(
        (machine) => machine.title === currentTitle
      );
      if (index !== -1) {
        this.activeTab = index;
      } else {
        console.error('Invalid currentTitle:', currentTitle);
      }
    }
  },
  methods: {
    fetchMachineDetails() {
      // 假设从服务器获取数据【假数据】：
      const allMachines = {
        test1: {
          model: 18,
          serialNumber: '1213',
          ipAddress: '192.168.0.0',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '0',
          error: '13',
        },
        test2: {
          model: 15,
          serialNumber: '556',
          ipAddress: '192.168.0.0',
          health: 'no',
          hostname: 'vdaf',
          linkStatus: 'fine',
          warning: '8',
          error: '0',
        },
        test3: {
          model: 123,
          serialNumber: '345',
          ipAddress: '192.168.0.0',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '1',
          error: '2',
        },
        test4: {
          model: 787,
          serialNumber: '1213',
          ipAddress: '192.168.0.0',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '0',
          error: '1',
        },
        test5: {
          model: 90,
          serialNumber: '1310',
          ipAddress: '192.168.0.100',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '0',
          error: '0',
        },
        test6: {
          model: 18,
          serialNumber: '9490',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '0',
          error: '0',
        },
        test7: {
          model: 18,
          serialNumber: '4527',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '100',
          error: '0',
        },
        test8: {
          model: 18,
          serialNumber: '55558',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '0',
          error: '1',
        },
        test9: {
          model: 18,
          serialNumber: '987',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '3',
          error: '0',
        },
        test10: {
          model: 18,
          serialNumber: '657',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '10',
          error: '0',
        },
        test11: {
          model: 18,
          serialNumber: '7563',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '3',
          error: '0',
        },
        test12: {
          model: 323,
          serialNumber: '643',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '0',
          error: '0',
        },
      };

      //实际上的操作：
      // const allMachines = this.$store.getters['multimachine/multimachineValue'];

      //将数据映射为数组
      this.machines = Object.keys(allMachines).map((key) => ({
        title: key,
        ...allMachines[key],
      }));
    },
  },
};
</script>
<style>
.nav-item {
  background-color: aliceblue;
}
.tab-pane fade {
  background-color: antiquewhite;
}
</style>
