import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '@/types/store';

const state = {
  indicatorLedActiveState: false,
};
type State = typeof state;

const getters = {
  getIndicatorLedActiveState: (state: State) => state.indicatorLedActiveState,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setIndicatorLedActiveState(state: State, indicatorLedActiveState: any) {
    state.indicatorLedActiveState = indicatorLedActiveState;
  },
};

type Multations = keyof typeof mutations;

const actionsNames = [
  'getIndicatorLedActiveState',
  'saveIndicatorLedActiveState',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getIndicatorLedActiveState({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Systems/system')
      .then((response) => {
        commit(
          'setIndicatorLedActiveState',
          response.data.LocationIndicatorActive
        );
      })
      .catch((error) => console.log(error));
  },
  async saveIndicatorLedActiveState(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    payload: any
  ) {
    commit('setIndicatorLedActiveState', payload);
    return await api
      .patch('/redfish/v1/Systems/system', {
        LocationIndicatorActive: payload,
      })
      .catch((error) => {
        console.log(error);
        commit('setIndicatorLedActiveState', !payload);
        if (payload) {
          throw new Error(
            i18n.t('pageInventory.toast.errorEnableIdentifyLed') as string
          );
        } else {
          throw new Error(
            i18n.t('pageInventory.toast.errorDisableIdentifyLed') as string
          );
        }
      });
  },
};
const ServerLedStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default ServerLedStore;
