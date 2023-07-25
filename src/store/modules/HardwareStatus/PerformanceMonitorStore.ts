import api from '@/store/api';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  hostStatus: {},
};
type State = typeof state;

const getters = {
  hostStatus: (state: State) => {
    return state.hostStatus;
  },
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setHostStatus: (state: State, hostStatus: any) => {
    state.hostStatus = hostStatus;
  },
};
type Multations = keyof typeof mutations;

const actionsNames = ['getHostStatus'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getHostStatus({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Chassis/Pomelo_Chassis/HostStatus/')
      .then(async ({ data: { Members } }) => {
        const hardwares = Members.map(
          ({ '@odata.id': url }: { '@odata.id': string }) =>
            url.split('/')[url.split('/').length - 1]
        );
        let promises: Promise<void>[] = [];
        let HostStatus: {
          [index in typeof hardwares[number]]: any;
        } = {};
        hardwares.forEach((hardwareName: typeof hardwares[number]) => {
          // Initialize HostStatus for avoid random order.
          HostStatus[hardwareName] = '';
          let promise = api
            .get(
              '/redfish/v1/Chassis/Pomelo_Chassis/HostStatus/' + hardwareName
            )
            .then(({ data: { Data } }) => {
              HostStatus[hardwareName] = Data;
            })
            .catch((error) => {
              throw error;
            });
          promises.push(promise);
        });
        await api.all(promises).then(() => {
          commit('setHostStatus', HostStatus);
        });
      })
      .catch((error) => {
        throw error;
      });
  },
};

const PerformanceMonitorStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default PerformanceMonitorStore;
