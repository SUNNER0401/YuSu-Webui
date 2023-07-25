import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
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
  duringCalculateTime: 0,
};
type State = typeof state;

const getters = {
  powerCapValue: (state: State) => state.powerCapValue,
  powerConsumptionValue: (state: State) =>
    state.powerConsumptionValue.toFixed(1),
  powerChartData1: (state: State) => state.powerChartData1,
  ReadingRangeMax: (state: State) => state.ReadingRangeMax,
  startCalculateTime: (state: State) => state.startCalculateTime,
  calculateTime: (state: State) => state.duringCalculateTime,
  totalConsumedPower: (state: State) =>
    parseInt((state.totalConsumedPower as unknown) as string),
  averagePower: (state: State) =>
    parseInt((state.averagePower as unknown) as string),
  currentPeakPower: (state: State) =>
    parseInt((state.currentPeakPower as unknown) as string),
  historyInfo: (state: State) => state.historyInfo,
  chassisId: (state: State) => state.chassisId,
  powerChassisId: (state: State) => state.powerChassisId,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setPowerCapValue: (state: State, powerCapValue: any) =>
    (state.powerCapValue = powerCapValue),
  setPowerConsumptionValue: (state: State, powerConsumptionValue: any) =>
    (state.powerConsumptionValue = powerConsumptionValue),
  // Set power chart data currently.
  setpowerChartData1: (state: {
    powerChartData1Interval: number;
    powerChartData1: any[][];
    powerConsumptionValue: number;
    calculateTime: number;
    totalConsumedPower: number;
    averagePower: number;
  }) => {
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
  setReadingRangeMax: (state: State, ReadingRangeMax: any) => {
    state.ReadingRangeMax = ReadingRangeMax;
  },
  setStartCalculateTime: (state: State, time: any) => {
    state.startCalculateTime = time;
  },
  setHistoryInfo: (state: State, historyInfo: any) => {
    state.historyInfo = historyInfo;
  },
  setChassisId: (state: State, chassisId: any) => {
    state.chassisId = chassisId;
  },
  setPowerChassisId: (state: State, powerChassisId: any) => {
    state.powerChassisId = powerChassisId;
  },
  setCurrentPeakPower: (state: State, currentPeakPower: any) => {
    state.currentPeakPower = currentPeakPower;
  },
};
type Multations = keyof typeof mutations;

const actionsNames = [
  'setPowerCapUpdatedValue',
  'getPowerControl',
  'setPowerControl',
  'getReadingRangeMax',
  'startCalculate',
  'getChassisId',
  'getPowerChassisId',
  'getHistoryInfo',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  setPowerCapUpdatedValue(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    value: any
  ) {
    commit('setPowerCapValue', value);
  },
  async getPowerControl({
    commit,
    state,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
  async setPowerControl(
    { state }: ActionContext<ActionNames, Multations, State, Getters>,
    powerCapValue: any
  ) {
    let PowerChassisId = state.powerChassisId;
    const data = {
      PowerControl: [{ PowerLimit: { LimitInWatts: powerCapValue } }],
    };

    return await api
      .patch(`/redfish/v1/Chassis/${PowerChassisId}/Power`, data)
      .then(() => i18n.t('pageServerPowerOperations.toast.successSaveSettings'))
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageServerPowerOperations.toast.errorSaveSettings') as string
        );
      });
  },
  async getReadingRangeMax({
    commit,
    state,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    let currentPeakPower = state.currentPeakPower;
    if (currentPeakPower > 100) {
      let ReadingRangeMax = currentPeakPower + 10;
      commit('setReadingRangeMax', ReadingRangeMax);
    }
  },
  startCalculate({
    commit,
    state,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    // Clear calculating time.
    state.calculateTime = 0;
    state.totalConsumedPower = 0;
    state.averagePower = 0;
    // Set start calculating time.
    const startCalculateTime = new Date();
    commit('setStartCalculateTime', startCalculateTime);
  },
  async getChassisId({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    let chassisId: any[] = [];
    await api.get('/redfish/v1/Chassis/').then(({ data: { Members } }) => {
      for (let member of Members) {
        let chassisUrl = Object.values(member)[0] as string;
        chassisId.push(chassisUrl.split('/')[chassisUrl.split('/').length - 1]);
      }
    });
    commit('setChassisId', chassisId);
    return chassisId;
  },
  // Get the Chassis ID whose Power page contains OEM and PowerConsumedWatts.
  async getPowerChassisId({
    dispatch,
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    let chassisId = await dispatch('getChassisId');
    let promises: any[] = [];
    chassisId.forEach((id: any) => {
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
  async getHistoryInfo({ commit, state }: any) {
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
};

const PowerControlStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default PowerControlStore;
