import api from '@/store/api';

const ConfigureManagementStore = {
  namespaced: true,
  state: {
    sensorInfo: [],
  },
  getters: {
    sensorInfo: (state: { sensorInfo: any }) => state.sensorInfo,
  },
  mutations: {
    setInfo(state: any, info: { [index: string]: any }) {
      state.sensorInfo = info.Sensor;
    },
  },
  actions: {
    async getConfigures({ commit }: any) {
      let promises: Promise<void>[] = [];
      let info: { [index: string]: any } = {};
      const configureUrls: { [index: string]: string } = {
        Sensors: '/oem/v1/Sensors/Thresholds',
      };
      for (let option in configureUrls) {
        let promise = api.get(configureUrls[option]).then(({ data }) => {
          info.Sensor = data[option];
        });
        promises.push(promise);
      }
      await api
        .all(promises)
        .then(() => {
          commit('setInfo', info);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async UpdateSensorConfigure(
      { dispatch }: any,
      diffList: { items: { [index: string]: any }[] }
    ) {
      await api
        .patch('/oem/v1/Sensors/Thresholds', diffList)
        .catch((error) => {
          throw error;
        })
        .finally(() => {
          dispatch('getConfigures');
        });
    },
  },
};

export default ConfigureManagementStore;
