import api from '@/store/api';

const PerformanceMonitorStore = {
  namespaced: true,
  state: {
    hostStatus: {},
  },
  getters: {
    hostStatus: (state: { hostStatus: any }) => {
      return state.hostStatus;
    },
  },
  mutations: {
    setHostStatus: (state: { hostStatus: any }, hostStatus: any) => {
      state.hostStatus = hostStatus;
    },
  },
  actions: {
    async getHostStatus({ commit }: any) {
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
  },
};

export default PerformanceMonitorStore;
