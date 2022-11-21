import api from '@/store/api';
import i18n from '@/i18n';

/**
 * Watch for serverStatus changes in GlobalStore module
 * to set isOperationInProgress state
 * Stop watching status changes and resolve Promise when
 * serverStatus value matches passed argument or after 5 minutes
 * @param {string} serverStatus
 * @returns {Promise}
 */
const checkForServerStatus = function (serverStatus: any) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      resolve();
      unwatch();
    }, 300000 /*5mins*/);
    const timer2 = setInterval(() => {
      this.dispatch('global/getSystemInfo');
    }, 1000);
    const unwatch = this.watch(
      (state: { global: { serverStatus: any } }) => state.global.serverStatus,
      (value: any) => {
        if (value === serverStatus) {
          resolve();
          unwatch();
          clearTimeout(timer);
          clearInterval(timer2);
        }
      }
    );
  });
};

const ControlStore = {
  namespaced: true,
  state: {
    isOperationInProgress: false,
    lastPowerOperationTime: null,
    lastBmcRebootTime: null,
  },
  getters: {
    isOperationInProgress: (state: { isOperationInProgress: any }) =>
      state.isOperationInProgress,
    lastPowerOperationTime: (state: { lastPowerOperationTime: any }) =>
      state.lastPowerOperationTime,
    lastBmcRebootTime: (state: { lastBmcRebootTime: any }) =>
      state.lastBmcRebootTime,
  },
  mutations: {
    setOperationInProgress: (
      state: { isOperationInProgress: any },
      inProgress: any
    ) => (state.isOperationInProgress = inProgress),
    setLastPowerOperationTime: (
      state: { lastPowerOperationTime: any },
      lastPowerOperationTime: any
    ) => (state.lastPowerOperationTime = lastPowerOperationTime),
    setLastBmcRebootTime: (
      state: { lastBmcRebootTime: any },
      lastBmcRebootTime: any
    ) => (state.lastBmcRebootTime = lastBmcRebootTime),
  },
  actions: {
    async getLastPowerOperationTime({ commit }: any) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then((response) => {
          const lastReset = response.data.LastResetTime;
          if (lastReset) {
            const lastPowerOperationTime = new Date(lastReset);
            commit('setLastPowerOperationTime', lastPowerOperationTime);
          }
        })
        .catch((error) => console.log(error));
    },
    getLastBmcRebootTime({ commit }: any) {
      return api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          const lastBmcReset = response.data.LastResetTime;
          const lastBmcRebootTime = new Date(lastBmcReset);
          commit('setLastBmcRebootTime', lastBmcRebootTime);
        })
        .catch((error) => console.log(error));
    },
    async rebootBmc({ dispatch }: any) {
      const data = { ResetType: 'GracefulRestart' };
      return await api
        .post('/redfish/v1/Managers/bmc/Actions/Manager.Reset', data, undefined)
        .then(() => dispatch('getLastBmcRebootTime'))
        .then(() => i18n.t('pageRebootBmc.toast.successRebootStart'))
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageRebootBmc.toast.errorRebootStart') as string
          );
        });
    },
    async serverPowerOn({ dispatch, commit }: any) {
      const data = { ResetType: 'On' };
      dispatch('serverPowerChange', data);
      await checkForServerStatus.bind(this, 'on')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    async serverSoftReboot({ dispatch, commit }: any) {
      const data = { ResetType: 'GracefulRestart' };
      dispatch('serverPowerChange', data);
      await checkForServerStatus.bind(this, 'on')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    async serverHardReboot({ dispatch, commit }: any) {
      const data = { ResetType: 'ForceRestart' };
      dispatch('serverPowerChange', data);
      await checkForServerStatus.bind(this, 'on')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    async serverSoftPowerOff({ dispatch, commit }: any) {
      const data = { ResetType: 'GracefulShutdown' };
      dispatch('serverPowerChange', data);
      await checkForServerStatus.bind(this, 'off')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    async serverHardPowerOff({ dispatch, commit }: any) {
      const data = { ResetType: 'ForceOff' };
      dispatch('serverPowerChange', data);
      await checkForServerStatus.bind(this, 'off')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    serverPowerChange({ commit }: any, data: any) {
      commit('setOperationInProgress', true);
      api
        .post(
          '/redfish/v1/Systems/system/Actions/ComputerSystem.Reset',
          data,
          undefined
        )
        .catch((error) => {
          console.log(error);
          commit('setOperationInProgress', false);
        });
    },
  },
};

export default ControlStore;
