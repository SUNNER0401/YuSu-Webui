import api from '@/store/api';
import i18n from '@/i18n';

const ServerLedStore = {
  namespaced: true,
  state: {
    indicatorLedActiveState: false,
  },
  getters: {
    getIndicatorLedActiveState: (state: { indicatorLedActiveState: any }) =>
      state.indicatorLedActiveState,
  },
  mutations: {
    setIndicatorLedActiveState(
      state: { indicatorLedActiveState: any },
      indicatorLedActiveState: any
    ) {
      state.indicatorLedActiveState = indicatorLedActiveState;
    },
  },
  actions: {
    async getIndicatorLedActiveState({ commit }: any) {
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
    async saveIndicatorLedActiveState({ commit }: any, payload: any) {
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
  },
};

export default ServerLedStore;
