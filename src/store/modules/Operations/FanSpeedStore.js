import api from '@/store/api';
import i18n from '@/i18n';

const FanSpeedStore = {
  namespaced: true,
  state: {
    fanTargets: {
      CPU1_FAN: '',
      CPU2_FAN: '',
      SYS_FAN3: '',
      SYS_FAN4: '',
      SYS_FAN5: '',
      SYS_FAN6: '',
    },
    fanUrls: [],
    fanMode: '',
  },
  getters: {
    fanSpeeds: (state) => {
      return {
        CPU1_FAN: ((state.fanTargets.CPU1_FAN / 255) * 100).toFixed(2) + '%',
        CPU2_FAN: ((state.fanTargets.CPU2_FAN / 255) * 100).toFixed(2) + '%',
        SYS_FAN3: ((state.fanTargets.SYS_FAN3 / 255) * 100).toFixed(2) + '%',
        SYS_FAN4: ((state.fanTargets.SYS_FAN4 / 255) * 100).toFixed(2) + '%',
        SYS_FAN5: ((state.fanTargets.SYS_FAN5 / 255) * 100).toFixed(2) + '%',
        SYS_FAN6: ((state.fanTargets.SYS_FAN6 / 255) * 100).toFixed(2) + '%',
      };
    },
    fanUrls: (state) => state.fanUrls,
    fanMode: (state) => {
      if (state.fanMode)
        return i18n.t('pageFanSpeed.fanModes.' + state.fanMode.toLowerCase());
    },
  },
  mutations: {
    getAllFanUrls(state, urls) {
      state.fanUrls = urls;
    },
    getFanModeInfo(state, fanMode) {
      state.fanMode = fanMode;
    },
    getFanTarget(state, { fanName, Target }) {
      state.fanTargets[fanName] = Target;
    },
  },
  actions: {
    async getFanSpeedData({ dispatch }) {
      await dispatch('getFanTarget');
      await dispatch('getFanModeInfo');
    },
    async switch2NormalMode({ dispatch }) {
      await dispatch('amendFanMode', 'DEFAULT').catch((error) => {
        throw error;
      });
      dispatch('getFanSpeedData');
    },
    async setFanMode({ dispatch }, mode) {
      const Supported = ['DEFAULT', 'MUTE', 'LOW', 'MEDIUM', 'HIGH', 'FULL'];
      if (!Supported.includes(mode)) {
        console.log('wrong mode!!!');
        return;
      }
      await dispatch('amendFanMode', mode).catch((error) => {
        throw error;
      });
      dispatch('getFanSpeedData');
    },
    async amendFanMode(context, mode) {
      for (let num = 0; num < 4; num++) {
        const data = JSON.stringify({ data: mode });
        await api
          .put(
            '/xyz/openbmc_project/control/thermal/' + num + '/attr/Current',
            data
          )
          .then(() => {
            console.log('current' + num + ' amend to ' + mode + ' success!!!');
          })
          .catch((error) => {
            throw error;
          });
      }
    },
    getFanModeInfo({ commit }) {
      api.get('/xyz/openbmc_project/control/thermal/0').then(({ data }) => {
        commit('getFanModeInfo', data.data.Current);
      });
    },
    getAllFanUrls({ commit }) {
      return api
        .get('/xyz/openbmc_project/sensors/fan_tach/')
        .then(({ data }) => {
          commit('getAllFanUrls', data.data);
          return data.data;
        });
    },
    async getFanTarget({ dispatch, commit }) {
      const fanUrls = await dispatch('getAllFanUrls');
      for (let url of fanUrls) {
        let fanName = url.split('/fan_tach/')[1];
        api.get(url).then(({ data }) => {
          commit('getFanTarget', { fanName, Target: data.data.Target });
        });
      }
    },
  },
};
export default FanSpeedStore;
