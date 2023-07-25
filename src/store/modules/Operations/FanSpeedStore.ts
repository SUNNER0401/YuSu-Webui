import api from '@/store/api';
import { cloneDeep } from 'lodash';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  fanSpeeds: {} as { [index: string]: number },
  fanNames: [] as string[],
  fanUrls: [] as string[],
  pwmUrls: [] as string[],
  pwmValues: {} as { [index: string]: number },
  pwmRelation: {} as { [index: string]: any },
  fanModes: {} as { [index: string]: any },
  allModes: [] as string[],
  zones: {} as { [index: string]: string },
  allInfo: {} as { [index: string]: any },
};
type State = typeof state;

const getters = {
  fanSpeeds: (state: State) => state.fanSpeeds,
  fanNames: (state: State) => state.fanNames,
  fanUrls: (state: State) => state.fanUrls,
  pwmUrls: (state: State) => state.pwmUrls,
  pwmValues: (state: State) => state.pwmValues,
  pwmRelation: (state: State) => state.pwmRelation,
  fanModes: (state: State) => state.fanModes,
  allModes: (state: State) => state.allModes,
  allInfo: (state: State) => state.allInfo,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  getAllFanUrls(state: State, urls: any) {
    state.fanUrls = urls;
  },
  getFanModeInfo(state: State, { zoneName, currentmode }: any) {
    state.fanModes[zoneName] = currentmode;
    state.fanModes = cloneDeep(state.fanModes);
    // The above code cannot be ignored, otherwise you will lose the
    // ability to watch vuex object type data.Because vue cannot watch
    // properties which are pushed into object after first created time.
  },
  setFanSpeeds(state: State, fanSpeeds: any) {
    state.fanSpeeds = fanSpeeds;
  },
  setAllModes(state: State, allModes: any) {
    state.allModes = allModes;
  },
  setFanName(state: State, fanNames: any) {
    state.fanNames = fanNames;
  },
  setAllInfo(state: State, allInfo: any) {
    state.allInfo = allInfo;
  },
  setPwmValues(state: State, allPwmValues: any) {
    state.pwmValues = allPwmValues;
  },
  setPwmRelation(state: State, pwmRelation: any) {
    state.pwmRelation = pwmRelation;
  },
};

type Multations = keyof typeof mutations;

const actionsNames = [
  'getFanAllData',
  'setFanMode',
  'setPwmValue',
  'getAllModes',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  // Used for obtaining fan informations
  async getFanAllData({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
  async setFanMode(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    { zone, mode }: { zone: number; mode: string }
  ) {
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
    _: ActionContext<ActionNames, Multations, State, Getters>,
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
  async getAllModes({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get(`/xyz/openbmc_project/control/thermal/0`)
      .then(({ data: { data } }) => {
        commit('setAllModes', data.Supported);
      });
  },
};

const FanSpeedStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
export default FanSpeedStore;
