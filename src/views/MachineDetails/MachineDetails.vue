<template>
  <b-container fluid>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <page-title />
      <b-button variant="secondary" @click="goBack">返回</b-button>
    </div>
    <b-card no-body>
      <b-tabs v-model="activeTab" justified card>
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
              <li>
                健康状态:
                {{ machine.health }}
                <svg-icon
                  :icon-class="
                    machine.health === 'yes' ? 'healthy' : 'unhealthy'
                  "
                />
              </li>
              <li>主机名: {{ machine.hostname }}</li>
              <li>
                连接状态: {{ machine.linkStatus
                }}<svg-icon
                  :icon-class="
                    machine.linkStatus === 'fine' ? 'linkage-interrupt' : ''
                  "
                />
              </li>
              <li v-if="machine.warning !== '0'" style="color: orange">
                警告信息: {{ machine.warning }}
                <svg-icon icon-class="warning" />
              </li>
              <li v-else>警告信息: {{ machine.warning }}</li>
              <li v-if="machine.error !== '0'" style="color: red">
                错误信息: {{ machine.error }}
                <svg-icon icon-class="error" />
              </li>
              <li v-else>错误信息: {{ machine.error }}</li>
              <li>
                机器状态:{{ machine.power }}<svg-icon icon-class="power-on" />
                <svg-icon icon-class="power-off" />
              </li>
            </ul>
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
    <div class="text-center">
      <b-button-group class="mt-2">
        <b-button @click="activeTab--">前一项</b-button>
        <b-button @click="activeTab++">后一项</b-button>
      </b-button-group>
    </div>
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
    goBack() {
      this.$router.push('/multimachine');
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
.card-header {
  background: linear-gradient(138deg, #acb6e56b, #86fde83d);
  border-bottom: 0px solid rgba(0, 0, 0, 0.125);
  padding-top: 20px;
  padding-bottom: 20px;
}
.tab-content > .active {
  font-size: 18px;
}
.card {
  border-radius: 30px;
}
.card-header {
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
}
.card-body {
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
}
.nav-tabs .nav-link.active,
.nav-tabs .nav-item.show .nav-link {
  color: #393737;
  background-color: #91cfcaa8;
  border-color: #aca2a2b0 #aca2a2b0 #1d0606;
}
/* 渐变切换效果 */
</style>
