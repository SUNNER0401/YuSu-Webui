import api from '@/store/api';
import { sortBy } from 'lodash';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  fanSpeeds: {} as { [index: string]: number },
  pwmValues: {} as { [index: string]: number },
  zoneInfos: {} as { [index: string]: any },
};
type State = typeof state;

const getters = {
  fanSpeeds: (state: State) => state.fanSpeeds,
  pwmValues: (state: State) => state.pwmValues,
  zoneInfos: (state: State) => state.zoneInfos,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setFanSpeeds(state: State, fanSpeeds: any) {
    state.fanSpeeds = fanSpeeds;
  },
  setZoneInfo(state: State, zoneInfo: any) {
    state.zoneInfos = zoneInfo;
  },
  setPwmValues(state: State, allPwmValues: any) {
    state.pwmValues = allPwmValues;
  },
};

type Multations = keyof typeof mutations;

const actionsNames = ['getFanAllData', 'setFanMode', 'setPwmValue'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  // Used for obtaining fan informations
  async getFanAllData({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    api
      .get('/redfish/v1/Managers/bmc/oem/phosphor-fan-control')
      .then(({ data: { PwmInfo, TachInfo, ZoneInfo } }) => {
        ZoneInfo = sortBy(ZoneInfo, (item: { ZoneID: number }) => item.ZoneID);
        commit('setZoneInfo', ZoneInfo);
        commit('setPwmValues', PwmInfo);
        commit('setFanSpeeds', TachInfo);
      })
      .catch((err) => {
        throw err;
      });
  },
  async manualControl(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    {
      zoneInfo,
      pwmValues,
    }: {
      zoneInfo: { [index: string]: any };
      pwmValues: { [index: string]: any };
    }
  ) {
    let ZoneInfo = {
      ZoneInfo: [{ Current: zoneInfo.Current, ZoneID: zoneInfo.ZoneID }],
    };
    let PwmInfo = { PwmInfo: {} as any };
    if (zoneInfo.Current == 'MANUAL_MODE') {
      Object.keys(zoneInfo.FanInfo).forEach((pwmName) => {
        PwmInfo.PwmInfo[pwmName] = pwmValues[pwmName];
      });
    }
    let payload = {};
    Object.assign(payload, ZoneInfo, PwmInfo);
    return await api
      .patch('/redfish/v1/Managers/bmc/oem/phosphor-fan-control', payload)
      .catch((err) => {
        throw err;
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
