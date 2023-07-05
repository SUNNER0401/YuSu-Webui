import api from '@/store/api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerRestoreCurrentPolicy: null,
    powerRestorePolicies: [],
  },
  getters: {
    powerRestoreCurrentPolicy: (state: { powerRestoreCurrentPolicy: any }) =>
      state.powerRestoreCurrentPolicy,
    powerRestorePolicies: (state: { powerRestorePolicies: any }) =>
      state.powerRestorePolicies,
  },
  mutations: {
    setPowerRestoreCurrentPolicy: (
      state: { powerRestoreCurrentPolicy: any },
      powerRestoreCurrentPolicy: any
    ) => (state.powerRestoreCurrentPolicy = powerRestoreCurrentPolicy),
    setPowerRestorePolicies: (
      state: { powerRestorePolicies: any },
      powerRestorePolicies: any
    ) => (state.powerRestorePolicies = powerRestorePolicies),
  },
  actions: {
    async getPowerRestorePolicies({ commit }: any) {
      return await api
        .get('/redfish/v1/JsonSchemas/ComputerSystem/ComputerSystem.json')
        .then(
          ({
            data: {
              definitions: { PowerRestorePolicyTypes = {} },
            },
          }) => {
            let powerPoliciesData = PowerRestorePolicyTypes.enum.map(
              (powerState: string | number) => {
                let desc = `${i18n.t(
                  `pagePowerRestorePolicy.policies.${powerState}`
                )} - ${PowerRestorePolicyTypes.enumDescriptions[powerState]}`;
                return {
                  state: powerState,
                  desc,
                };
              }
            );
            commit('setPowerRestorePolicies', powerPoliciesData);
          }
        );
    },
    async getPowerRestoreCurrentPolicy({ commit }: any) {
      api
        .get('/redfish/v1/Systems/system')
        .then(({ data: { PowerRestorePolicy } }) => {
          commit('setPowerRestoreCurrentPolicy', PowerRestorePolicy);
        })
        .catch((error) => console.log(error));
    },
    async setPowerRestorePolicy({ commit }: any, powerPolicy: any) {
      const data = { PowerRestorePolicy: powerPolicy };

      return await api
        .patch('/redfish/v1/Systems/system', data)
        .then(() =>
          commit('setPowerRestoreCurrentPolicy', data.PowerRestorePolicy)
        )
        .then(() => i18n.t('pagePowerRestorePolicy.toast.successSaveSettings'))
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pagePowerRestorePolicy.toast.errorSaveSettings') as string
          );
        });
    },
  },
};

export default PowerControlStore;
