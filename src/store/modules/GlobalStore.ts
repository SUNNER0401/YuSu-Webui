import api from '@/store/api';
import { AxiosResponse } from 'axios';

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

const GlobalStore = {
  namespaced: true,
  state: {
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
  },
  getters: {
    assetTag: (state: { assetTag: any }) => state.assetTag,
    modelType: (state: { modelType: any }) => state.modelType,
    serialNumber: (state: { serialNumber: any }) => state.serialNumber,
    serverStatus: (state: { serverStatus: any }) => state.serverStatus,
    bmcTime: (state: { bmcTime: any }) => state.bmcTime,
    languagePreference: (state: { languagePreference: any }) =>
      state.languagePreference,
    isUtcDisplay: (state: { isUtcDisplay: any }) => state.isUtcDisplay,
    username: (state: { username: any }) => state.username,
    isAuthorized: (state: { isAuthorized: any }) => state.isAuthorized,
  },
  mutations: {
    setAssetTag: (state: { assetTag: any }, assetTag: any) =>
      (state.assetTag = assetTag),
    setModelType: (state: { modelType: any }, modelType: any) =>
      (state.modelType = modelType),
    setSerialNumber: (state: { serialNumber: any }, serialNumber: any) =>
      (state.serialNumber = serialNumber),
    setBmcTime: (state: { bmcTime: any }, bmcTime: any) =>
      (state.bmcTime = bmcTime),
    setServerStatus: (state: { serverStatus: string }, serverState: any) =>
      (state.serverStatus = serverStateMapper(serverState)),
    setLanguagePreference: (
      state: { languagePreference: any },
      language: any
    ) => (state.languagePreference = language),
    setUsername: (state: { username: any }, username: any) =>
      (state.username = username),
    setUtcTime: (state: { isUtcDisplay: any }, isUtcDisplay: any) =>
      (state.isUtcDisplay = isUtcDisplay),
    setUnauthorized: (state: { isAuthorized: boolean }) => {
      state.isAuthorized = false;
      window.setTimeout(() => {
        state.isAuthorized = true;
      }, 100);
    },
  },
  actions: {
    async getBmcTime({ commit }: { commit: any }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          const bmcDateTime = response.data.DateTime;
          const date = new Date(bmcDateTime);
          commit('setBmcTime', date);
        })
        .catch((error) => console.log(error));
    },
    getSystemInfo({ commit }: { commit: any }) {
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
  },
};

export default GlobalStore;
