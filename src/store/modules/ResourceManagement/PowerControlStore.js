import api from '@/store/api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerCapValue: null,
    powerConsumptionValue: 0,
    powerChartData1: [], // current power chart data.
    powerChartData1Interval: null, // current power chart data Interval.
    ReadingRangeMax: 100,
    startCalculateTime: null,
    calculateTime: 0,
    totalConsumedPower: 0,
    averagePower: 0,
    currentPeakPower: 0,
    historyInfo: [],
    chassisId: [],
    powerChassisId: [],
  },
  getters: {
    powerCapValue: (state) => state.powerCapValue,
    powerConsumptionValue: (state) => state.powerConsumptionValue.toFixed(1),
    powerChartData1: (state) => state.powerChartData1,
    ReadingRangeMax: (state) => state.ReadingRangeMax,
    startCalculateTime: (state) => state.startCalculateTime,
    calculateTime: (state) => state.duringCalculateTime,
    totalConsumedPower: (state) => parseInt(state.totalConsumedPower),
    averagePower: (state) => parseInt(state.averagePower),
    currentPeakPower: (state) => parseInt(state.currentPeakPower),
    historyInfo: (state) => state.historyInfo,
    chassisId: (state) => state.chassisId,
    powerChassisId: (state) => state.powerChassisId,
  },
  mutations: {
    setPowerCapValue: (state, powerCapValue) =>
      (state.powerCapValue = powerCapValue),
    setPowerConsumptionValue: (state, powerConsumptionValue) =>
      (state.powerConsumptionValue = powerConsumptionValue),
    // Set power chart data currently.
    setpowerChartData1: (state) => {
      const step = 2;
      state.powerChartData1Interval = setInterval(() => {
        let now = new Date();
        if (state.powerChartData1.length <= 300) {
          state.powerChartData1.push([now, state.powerConsumptionValue]);
        } else {
          state.powerChartData1.shift();
          state.powerChartData1.push([now, state.powerConsumptionValue]);
        }
        state.calculateTime += step;
        state.totalConsumedPower += step * state.powerConsumptionValue;
        state.averagePower = state.totalConsumedPower / state.calculateTime;
      }, step * 1000);
    },
    setReadingRangeMax: (state, ReadingRangeMax) => {
      state.ReadingRangeMax = ReadingRangeMax;
    },
    setStartCalculateTime: (state, time) => {
      state.startCalculateTime = time;
    },
    setHistoryInfo: (state, historyInfo) => {
      state.historyInfo = historyInfo;
    },
    setChassisId: (state, chassisId) => {
      state.chassisId = chassisId;
    },
    setPowerChassisId: (state, powerChassisId) => {
      state.powerChassisId = powerChassisId;
    },
    setCurrentPeakPower: (state, currentPeakPower) => {
      state.currentPeakPower = currentPeakPower;
    },
  },
  actions: {
    setPowerCapUpdatedValue({ commit }, value) {
      commit('setPowerCapValue', value);
    },
    async getPowerControl({ commit, state }) {
      let PowerChassisId = state.powerChassisId;
      return await api
        .get(`/redfish/v1/Chassis/${PowerChassisId}/Power`)
        .then((response) => {
          const powerControl = response.data.PowerControl;
          const powerCap = powerControl[0].PowerLimit.LimitInWatts;
          // If system is powered off, power consumption does not exist in the PowerControl
          const powerConsumption = powerControl[0].PowerConsumedWatts;

          commit('setPowerCapValue', powerCap);
          commit('setPowerConsumptionValue', powerConsumption);
        })
        .catch((error) => {
          console.log('Power control', error);
        });
    },
    async setPowerControl({ state }, powerCapValue) {
      let PowerChassisId = state.powerChassisId;
      const data = {
        PowerControl: [{ PowerLimit: { LimitInWatts: powerCapValue } }],
      };

      return await api
        .patch(`/redfish/v1/Chassis/${PowerChassisId}/Power`, data)
        .then(() =>
          i18n.t('pageServerPowerOperations.toast.successSaveSettings')
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
          );
        });
    },
    async getReadingRangeMax({ commit, state }) {
      let currentPeakPower = state.currentPeakPower;
      if (currentPeakPower > 100) {
        let ReadingRangeMax = currentPeakPower + 10;
        commit('setReadingRangeMax', ReadingRangeMax);
      }
    },
    startCalculate({ commit, state }) {
      // Clear calculating time.
      state.calculateTime = 0;
      state.totalConsumedPower = 0;
      state.averagePower = 0;
      // Set start calculating time.
      const startCalculateTime = new Date();
      commit('setStartCalculateTime', startCalculateTime);
    },
    async getChassisId({ commit }) {
      let chassisId = [];
      await api.get('/redfish/v1/Chassis/').then(({ data: { Members } }) => {
        for (let member of Members) {
          let chassisUrl = Object.values(member)[0];
          chassisId.push(
            chassisUrl.split('/')[chassisUrl.split('/').length - 1]
          );
        }
      });
      commit('setChassisId', chassisId);
      return chassisId;
    },
    // Get the Chassis ID whose Power page contains OEM and PowerConsumedWatts.
    async getPowerChassisId({ dispatch, commit }) {
      let chassisId = await dispatch('getChassisId');
      let promises = [];
      chassisId.forEach((id) => {
        let p = api
          .get(`/redfish/v1/Chassis/${id}/Power`)
          .then(({ data }) => {
            if (!data.PowerControl[0].Oem) {
              chassisId.pop(id);
            }
          })
          .catch((error) => {
            console.log(error);
          });
        promises.push(p);
      });
      await Promise.all(promises);
      commit('setPowerChassisId', chassisId);
      return chassisId;
    },
    async getHistoryInfo({ commit, state }) {
      let PowerChassisId = state.powerChassisId;
      let promise1 = api
        .get(`/redfish/v1/Chassis/${PowerChassisId}/Power`)
        .then(({ data }) => {
          let OemUrl = data.PowerControl[0].Oem['@odata.id'];
          return OemUrl;
        })
        .then(async (OemUrl) => {
          let promise2 = api.get(OemUrl).then(({ data: { Data } }) => {
            commit('setHistoryInfo', Data);
          });
          await Promise.all([promise2]);
        })
        .catch((error) => {
          return error;
        });
      await Promise.all([promise1]).then(
        api.spread((value) => {
          // Only output error messages.
          if (value) {
            console.log(value);
          }
        })
      );
    },
  },
};

export default PowerControlStore;
