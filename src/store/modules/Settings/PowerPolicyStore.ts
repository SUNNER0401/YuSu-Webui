import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  powerRestoreCurrentPolicy: null,
  powerRestorePolicies: [],
};
type State = typeof state;

const getters = {
  powerRestoreCurrentPolicy: (state: State) => state.powerRestoreCurrentPolicy,
  powerRestorePolicies: (state: State) => state.powerRestorePolicies,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setPowerRestoreCurrentPolicy: (
    state: State,
    powerRestoreCurrentPolicy: any
  ) => (state.powerRestoreCurrentPolicy = powerRestoreCurrentPolicy),
  setPowerRestorePolicies: (state: State, powerRestorePolicies: any) =>
    (state.powerRestorePolicies = powerRestorePolicies),
};
type Multations = keyof typeof mutations;

const actionsNames = [
  'getPowerRestorePolicies',
  'getPowerRestoreCurrentPolicy',
  'setPowerRestorePolicy',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getPowerRestorePolicies({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
  async getPowerRestoreCurrentPolicy({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    api
      .get('/redfish/v1/Systems/system')
      .then(({ data: { PowerRestorePolicy } }) => {
        commit('setPowerRestoreCurrentPolicy', PowerRestorePolicy);
      })
      .catch((error) => console.log(error));
  },
  async setPowerRestorePolicy(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    powerPolicy: any
  ) {
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
};

const PowerControlStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default PowerControlStore;
