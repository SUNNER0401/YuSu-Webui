import api from '@/store/api';
import i18n from '@/i18n';

const BootSettingsStore = {
  namespaced: true,
  state: {
    bootSourceOptions: [],
    bootSource: null,
    overrideEnabled: null,
    tpmEnabled: null,
  },
  getters: {
    bootSourceOptions: (state: { bootSourceOptions: any }) =>
      state.bootSourceOptions,
    bootSource: (state: { bootSource: any }) => state.bootSource,
    overrideEnabled: (state: { overrideEnabled: any }) => state.overrideEnabled,
    tpmEnabled: (state: { tpmEnabled: any }) => state.tpmEnabled,
  },
  mutations: {
    setBootSourceOptions: (
      state: { bootSourceOptions: any },
      bootSourceOptions: any
    ) => (state.bootSourceOptions = bootSourceOptions),
    setBootSource: (state: { bootSource: any }, bootSource: any) =>
      (state.bootSource = bootSource),
    setOverrideEnabled: (
      state: { overrideEnabled: boolean },
      overrideEnabled: string
    ) => {
      if (overrideEnabled === 'Once') {
        state.overrideEnabled = true;
      } else {
        // 'Continuous' or 'Disabled'
        state.overrideEnabled = false;
      }
    },
    setTpmPolicy: (state: { tpmEnabled: any }, tpmEnabled: any) =>
      (state.tpmEnabled = tpmEnabled),
  },
  actions: {
    async getBootSettings({ commit }: any) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then(({ data: { Boot } }) => {
          commit(
            'setBootSourceOptions',
            Boot['BootSourceOverrideTarget@Redfish.AllowableValues']
          );
          commit('setOverrideEnabled', Boot.BootSourceOverrideEnabled);
          commit('setBootSource', Boot.BootSourceOverrideTarget);
        })
        .catch((error) => console.log(error));
    },
    saveBootSettings(
      { commit, dispatch }: any,
      {
        bootSource,
        overrideEnabled,
      }: { bootSource: string; overrideEnabled: boolean }
    ) {
      const data: { Boot: { [index: string]: string } } = { Boot: {} };
      data.Boot.BootSourceOverrideTarget = bootSource;

      if (overrideEnabled) {
        data.Boot.BootSourceOverrideEnabled = 'Once';
      } else if (bootSource === 'None') {
        data.Boot.BootSourceOverrideEnabled = 'Disabled';
      } else {
        data.Boot.BootSourceOverrideEnabled = 'Continuous';
      }

      return api
        .patch('/redfish/v1/Systems/system', data)
        .then((response) => {
          // If request success, commit the values
          commit('setBootSource', data.Boot.BootSourceOverrideTarget);
          commit('setOverrideEnabled', data.Boot.BootSourceOverrideEnabled);
          return response;
        })
        .catch((error) => {
          console.log(error);
          // If request error, GET saved options
          dispatch('getBootSettings');
          return error;
        });
    },
    async getTpmPolicy({ commit }: any) {
      // TODO: switch to Redfish when available
      return await api
        .get('/xyz/openbmc_project/control/host0/TPMEnable')
        .then(({ data: { data: { TPMEnable } } }) =>
          commit('setTpmPolicy', TPMEnable)
        )
        .catch((error) => console.log(error));
    },
    saveTpmPolicy({ commit, dispatch }: any, tpmEnabled: any) {
      // TODO: switch to Redfish when available
      const data = { data: tpmEnabled };
      return api
        .put(
          '/xyz/openbmc_project/control/host0/TPMEnable/attr/TPMEnable',
          data
        )
        .then((response) => {
          // If request success, commit the values
          commit('setTpmPolicy', tpmEnabled);
          return response;
        })
        .catch((error) => {
          console.log(error);
          // If request error, GET saved policy
          dispatch('getTpmPolicy');
          return error;
        });
    },
    async saveSettings(
      { dispatch }: any,
      {
        bootSource,
        overrideEnabled,
        tpmEnabled,
      }: {
        bootSource: string | boolean;
        overrideEnabled: boolean;
        tpmEnabled: boolean;
      }
    ) {
      const promises = [];

      if (bootSource !== null || overrideEnabled !== null) {
        promises.push(
          dispatch('saveBootSettings', { bootSource, overrideEnabled })
        );
      }
      if (tpmEnabled !== null) {
        promises.push(dispatch('saveTpmPolicy', tpmEnabled));
      }

      return await api.all(promises).then(
        api.spread((...responses) => {
          let message = i18n.t(
            'pageServerPowerOperations.toast.successSaveSettings'
          );
          responses.forEach((response) => {
            if (response instanceof Error) {
              throw new Error(
                i18n.t(
                  'pageServerPowerOperations.toast.errorSaveSettings'
                ) as string
              );
            }
          });
          return message;
        })
      );
    },
  },
};

export default BootSettingsStore;
