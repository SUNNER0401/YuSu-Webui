<template>
  <b-container
    fluid
    class="machine-details-container"
    style="margin-bottom: 50px"
  >
    <div class="d-flex justify-content-between align-items-center mb-3">
      <page-title />
      <button-group>
        <b-button @click="activeTab--">
          {{ $t('pageMachineDetails.previousPage') }}</b-button
        >
        <b-button @click="activeTab++">
          {{ $t('pageMachineDetails.nextPage') }}</b-button
        >
        <b-button variant="secondary" @click="goBack">
          {{ $t('pageMachineDetails.goBack') }}</b-button
        >
      </button-group>
    </div>
    <b-card no-body class="custom-card">
      <b-tabs v-model="activeTab" justified card>
        <b-tab
          v-for="(machine, key) in machines"
          :key="key"
          :title="machine.title"
        >
          <div class="machine-details-content">
            <div class="part1">
              <div class="rect"></div>
              <div class="subtitle">{{ machine.title }}</div>
              <div v-if="machine.powerStatus == 'on'" class="machine-status">
                {{ $t('pageMachineDetails.powerStatus')
                }}{{ machine.powerStatus }}
                <svg-icon icon-class="power-on" />
              </div>
              <div v-else class="machine-status">
                {{ $t('pageMachineDetails.powerStatus')
                }}{{ machine.powerStatus }}
                <svg-icon icon-class="power-off" />
              </div>
            </div>

            <div class="part2">
              <div class="machine-details-item">
                {{ $t('pageMachineDetails.model') }}{{ machine.model }}
              </div>
              <div class="machine-details-item">
                {{ $t('pageMachineDetails.serialNumber')
                }}{{ machine.serialNumber }}
              </div>
              <div class="machine-details-item">
                {{ $t('pageMachineDetails.ipAddress') }}{{ machine.ipAddress }}
              </div>
              <div class="machine-details-item">
                {{ $t('pageMachineDetails.hostname') }} {{ machine.hostname }}
              </div>
            </div>
            <div class="divider"></div>
            <div class="part3">
              <div class="machine-details-item">
                {{ $t('pageMachineDetails.health') }}
                {{ machine.health }}
                <svg-icon
                  :icon-class="
                    machine.health === 'yes' ? 'healthy' : 'unhealthy'
                  "
                />
              </div>
              <div
                v-if="machine.warning !== '0'"
                class="machine-details-item warning"
              >
                {{ $t('pageMachineDetails.warning') }} {{ machine.warning }}
                <svg-icon icon-class="warning" />
              </div>
              <div v-else class="machine-details-item">
                {{ $t('pageMachineDetails.warning') }} {{ machine.warning }}
              </div>
              <div class="machine-details-item">
                {{ $t('pageMachineDetails.linkStatus')
                }}{{ machine.linkStatus }}
                <svg-icon
                  :icon-class="
                    machine.linkStatus === 'fine'
                      ? 'linkage-fine'
                      : 'linkage-interrupt'
                  "
                />
              </div>

              <div
                v-if="machine.error !== '0'"
                class="machine-details-item error"
              >
                {{ $t('pageMachineDetails.error') }}{{ machine.error }}
                <svg-icon icon-class="error" />
              </div>
              <div v-else class="machine-details-item">
                {{ $t('pageMachineDetails.error') }}{{ machine.error }}
              </div>
            </div>
            <div class="divider"></div>
            <div class="part4">
              {{ $t('pageMachineDetails.sensors') }}
              <sensors-card></sensors-card>
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import SensorsCard from './SensorsCard.vue';
export default {
  name: 'MachinedDetails',
  components: {
    PageTitle,
    SensorsCard,
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
          linkStatus: 'interrupt',
          warning: '0',
          error: '13',
          powerStatus: 'on',
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
          powerStatus: 'off',
        },
        test3: {
          model: 123,
          serialNumber: '345',
          ipAddress: '192.168.0.0',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'interrupt',
          warning: '1',
          error: '2',
          powerStatus: 'on',
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
          powerStatus: 'off',
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
          powerStatus: 'on',
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
          powerStatus: 'off',
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
          powerStatus: 'on',
        },
        test8: {
          model: 18,
          serialNumber: '55558',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'interrupt',
          warning: '0',
          error: '1',
          powerStatus: 'on',
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
          powerStatus: 'on',
        },
        test10: {
          model: 18,
          serialNumber: '657',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'interrupt',
          warning: '10',
          error: '0',
          powerStatus: 'off',
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
          powerStatus: 'off',
        },
        test12: {
          model: 323,
          serialNumber: '643',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'interrupt',
          warning: '0',
          error: '0',
          powerStatus: 'off',
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
.machine-details-item.warning {
  color: orange;
}

.machine-details-item.error {
  color: red;
}
.machine-details-container .custom-card {
  border-radius: 30px;
}

.machine-details-container .custom-card .card-header {
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  background: linear-gradient(138deg, #acb6e56b, #86fde83d);
  border-bottom: 0;
  padding-top: 20px;
  padding-bottom: 20px;
}
.machine-details-container .nav-tabs .nav-link:hover {
  box-shadow: 0 2px 6px rgb(0 0 0 / 53%);
  transition: box-shadow 0.5s ease;
  /* transition: all 0.7s; */
}
.machine-details-container .custom-card .card-body {
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  padding-top: 0px;
  padding-left: 50px;
  padding-right: 50px;
}

.machine-details-container .nav-tabs .nav-link.active,
.machine-details-container .nav-tabs .nav-item.show .nav-link {
  color: #000000;
  background-color: #3f3f3f4a;
  border-color: #aca2a2b0 #aca2a2b0 #1d0606;
  box-shadow: 0 2px 6px rgb(0 0 0 / 53%);
}
.machine-details-container .nav-tabs .nav-link {
  margin-bottom: 0px;
  /* border: 1px solid #999999; */
  color: #6c6c6c;
  border-radius: 2px;
}
.machine-details-item {
  font-size: 16px;
}
.machine-details-content {
  display: flex;
  flex-direction: column;
}
/* 分割线 */
.divider {
  border-bottom: 1px solid #5a5c5e;
  margin: 8px 0;
}
.part1 {
  border-bottom: 1px solid #dfe7ec;
  height: 50px;
  overflow: hidden;
}
.machine-status {
  display: flex;
  justify-content: flex-end;
  margin-right: 100px;
  margin-top: 12px;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}
.part1 .rect {
  display: block;
  float: left;
  width: 5px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  background-color: #4c78e9;
  margin-right: 10px;
}

.part1 .subtitle {
  display: block;
  float: left;
  margin-top: 5px;
  margin-left: 5px;
  font-size: 20px;
  font-weight: bold;
}

.part2 {
  display: flex;
  margin-top: 5px;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

.part2 div {
  flex: 0 0 50%;
  box-sizing: border-box;
}

.part3 .machine-details-item {
  margin-top: 5px;
}
.part3 {
  display: flex;
  margin-top: 10px;
  flex-wrap: wrap;
  flex-direction: row;
  margin-bottom: 10px;
}

.part3 div {
  flex: 0 0 50%;
  /* 每个 div 占据父容器宽度的 50% */
  box-sizing: border-box;
  /* 包括 padding 和 border 在内 */
}

.loginfoshow {
  background: aliceblue;
  height: 300px;
}

.sensorinfoshow {
  background: aliceblue;
  height: 300px;
}
</style>
