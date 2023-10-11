import api from '@/store/api';
import { AxiosResponse } from 'axios';
import { ReturnGetters, ActionContext } from '../../types/store';

const HOST_STATE = {
  on: 'xyz.openbmc_project.State.Host.HostState.Running',
  off: 'xyz.openbmc_project.State.Host.HostState.Off',
  error: 'xyz.openbmc_project.State.Host.HostState.Quiesced',
  diagnosticMode: 'xyz.openbmc_project.State.Host.HostState.DiagnosticMode',
};

const serverStateMapper = (hostState: any) => {
  switch (hostState) {
    case HOST_STATE.on:
    case 'On': // Redfish PowerState
      return 'on';
    case HOST_STATE.off:
    case 'Off': // Redfish PowerState
      return 'off';
    case HOST_STATE.error:
    case 'Quiesced': // Redfish Status
      return 'error';
    case HOST_STATE.diagnosticMode:
    case 'InTest': // Redfish Status
      return 'diagnosticMode';
    default:
      return 'unreachable';
  }
};

const state = {
  assetTag: null,
  bmcTime: null,
  modelType: null,
  serialNumber: null,
  serverStatus: 'unreachable',
  languagePreference: localStorage.getItem('storedLanguage') || 'en-US',
  isUtcDisplay: localStorage.getItem('storedUtcDisplay')
    ? JSON.parse(localStorage.getItem('storedUtcDisplay') as string)
    : true,
  username: localStorage.getItem('storedUsername'),
  isAuthorized: true,
  userPrivilege: null as string | null,
};
type State = typeof state;

const getters = {
  assetTag: (state: State) => state.assetTag,
  modelType: (state: State) => state.modelType,
  serialNumber: (state: State) => state.serialNumber,
  serverStatus: (state: State) => state.serverStatus,
  bmcTime: (state: State) => state.bmcTime,
  languagePreference: (state: State) => state.languagePreference,
  isUtcDisplay: (state: State) => state.isUtcDisplay,
  username: (state: State) => state.username,
  isAuthorized: (state: State) => state.isAuthorized,
  userPrivilege: (state: State) => state.userPrivilege,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setAssetTag: (state: State, assetTag: any) => (state.assetTag = assetTag),
  setModelType: (state: State, modelType: any) => (state.modelType = modelType),
  setSerialNumber: (state: State, serialNumber: any) =>
    (state.serialNumber = serialNumber),
  setBmcTime: (state: State, bmcTime: any) => (state.bmcTime = bmcTime),
  setServerStatus: (state: State, serverState: any) =>
    (state.serverStatus = serverStateMapper(serverState)),
  setLanguagePreference: (state: State, language: any) =>
    (state.languagePreference = language),
  setUsername: (state: State, username: any) => (state.username = username),
  setUtcTime: (state: State, isUtcDisplay: any) =>
    (state.isUtcDisplay = isUtcDisplay),
  setUnauthorized: (state: State) => {
    state.isAuthorized = false;
    window.setTimeout(() => {
      state.isAuthorized = true;
    }, 100);
  },
  setPrivilege: (state: State, privilege: string) => {
    state.userPrivilege = privilege;
  },
};
type Multations = keyof typeof mutations;

const actionsNames = ['getBmcTime', 'getSystemInfo', 'getNowDateTime'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getBmcTime({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Managers/bmc')
      .then((response) => {
        const bmcDateTime = response.data.DateTime;
        const date = new Date(bmcDateTime);
        commit('setBmcTime', date);
      })
      .catch((error) => console.log(error));
  },
  getSystemInfo({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    api
      .get('/redfish/v1/Systems/system')
      .then(
        (
          {
            data: {
              AssetTag,
              Model,
              PowerState,
              SerialNumber,
              Status: { State } = {} as { State: any },
            },
          } = {} as AxiosResponse<any>
        ) => {
          commit('setAssetTag', AssetTag);
          commit('setSerialNumber', SerialNumber);
          commit('setModelType', Model);
          if (State === 'Quiesced' || State === 'InTest') {
            // OpenBMC's host state interface is mapped to 2 Redfish
            // properties "Status""State" and "PowerState". Look first
            // at State for certain cases.
            commit('setServerStatus', State);
          } else {
            commit('setServerStatus', PowerState);
          }
        }
      )
      .catch((error) => console.log(error));
  },
  // 格式化日对象
  getNowDateTime() {
    let date = new Date();
    let year: string | number = date.getFullYear(); // 年
    let month: string | number = date.getMonth() + 1; // 月
    let day: string | number = date.getDate(); // 日
    let hour: string | number = date.getHours(); // 时
    let minutes: string | number = date.getMinutes(); // 分
    let seconds: string | number = date.getSeconds(); //秒
    // 给一位数的数据前面加 “0”
    year = '' + year;
    if (month >= 1 && month <= 9) {
      month = '0' + month;
    }
    if (day >= 0 && day <= 9) {
      day = '0' + day;
    }
    if (hour >= 0 && hour <= 9) {
      hour = '0' + hour;
    }
    if (minutes >= 0 && minutes <= 9) {
      minutes = '0' + minutes;
    }
    if (seconds >= 0 && seconds <= 9) {
      seconds = '0' + seconds;
    }
    return year + month + day + hour + minutes + seconds;
  },
};

const GlobalStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default GlobalStore;
