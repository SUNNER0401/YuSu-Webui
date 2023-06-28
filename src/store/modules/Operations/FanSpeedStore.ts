import api from '@/store/api';
import { cloneDeep } from 'lodash';

const FanSpeedStore = {
  namespaced: true,
  state: {
    fanSpeeds: {},
    fanNames: [],
    fanUrls: [],
    pwmUrls: [],
    pwmValues: {},
    pwmRelation: {},
    fanModes: {},
    allModes: [],
    zones: {},
    allInfo: {},
  },
  getters: {
    fanSpeeds: (state: { fanSpeeds: any }) => state.fanSpeeds,
    fanNames: (state: { fanNames: any }) => state.fanNames,
    fanUrls: (state: { fanUrls: any }) => state.fanUrls,
    pwmUrls: (state: { pwmUrls: any }) => state.pwmUrls,
    pwmValues: (state: { pwmValues: any }) => state.pwmValues,
    pwmRelation: (state: { pwmRelation: any }) => state.pwmRelation,
    fanModes: (state: { fanModes: any }) => state.fanModes,
    allModes: (state: { allModes: any }) => state.allModes,
    allInfo: (state: { allInfo: any }) => state.allInfo,
  },
  mutations: {
    getAllFanUrls(state: { fanUrls: any }, urls: any) {
      state.fanUrls = urls;
    },
    getFanModeInfo(
      state: { fanModes: { [x: string]: any } },
      { zoneName, currentmode }: any
    ) {
      state.fanModes[zoneName] = currentmode;
      state.fanModes = cloneDeep(state.fanModes);
      // The above code cannot be ignored, otherwise you will lose the
      // ability to watch vuex object type data.Because vue cannot watch
      // properties which are pushed into object after first created time.
    },
    setFanSpeeds(state: { fanSpeeds: any }, fanSpeeds: any) {
      state.fanSpeeds = fanSpeeds;
    },
    setAllModes(state: { allModes: any }, allModes: any) {
      state.allModes = allModes;
    },
    setFanName(state: { fanNames: any }, fanNames: any) {
      state.fanNames = fanNames;
    },
    setAllInfo(state: { allInfo: any }, allInfo: any) {
      state.allInfo = allInfo;
    },
    setPwmValues(state: { pwmValues: any }, allPwmValues: any) {
      state.pwmValues = allPwmValues;
    },
    setPwmRelation(state: { pwmRelation: any }, pwmRelation: any) {
      state.pwmRelation = pwmRelation;
    },
  },
  actions: {
    // Used for obtaining fan informations
    async getFanAllData({ commit }: any) {
      api
        .get('/getFanInfo')
        .then(({ data: { AllInfo } }) => {
          commit('setAllInfo', AllInfo);
          // Get fanSpeeds object.
          let pwmValues: { [index: string]: number } = {};
          let fanSpeeds: { [index: string]: number } = {};
          AllInfo.map(({ fanInfo }: { [index: string]: any }) => {
            return fanInfo.forEach(
              ({
                Name,
                Pwm,
                FanSpeed,
              }: {
                Name: string;
                Pwm: number;
                FanSpeed: number;
              }) => {
                pwmValues[Name] = Pwm;
                fanSpeeds[Name] = FanSpeed;
              }
            );
          });
          commit('setPwmValues', pwmValues);
          commit('setFanSpeeds', fanSpeeds);
        })
        .catch((err) => {
          throw err;
        });
    },
    // Used for setting fan mode of specific zone
    async setFanMode(_: any, { zone, mode }: { zone: number; mode: string }) {
      return await api
        .patch('/setZoneMode', {
          data: {
            Zone: zone,
            Mode: mode,
          },
        })
        .catch((err) => {
          throw err;
        });
    },
    // Used for Setting pwm value of specific fan
    async setPwmValue(
      _: any,
      { zone, fanName, pwm }: { zone: number; fanName: string; pwm: number }
    ) {
      return await api
        .patch('/setPwm', {
          data: {
            Zone: zone,
            Name: fanName,
            Pwm: pwm,
          },
        })
        .catch((err) => {
          throw err;
        });
    },
    async getAllModes({ commit }: any) {
      return await api
        .get(`/xyz/openbmc_project/control/thermal/0`)
        .then(({ data: { data } }) => {
          commit('setAllModes', data.Supported);
        });
    },
  },
};
export default FanSpeedStore;
