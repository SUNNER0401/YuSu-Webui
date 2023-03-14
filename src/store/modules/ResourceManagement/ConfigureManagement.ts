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
    async download() {
      return await api
        .get('/oem/v1/Configs/Configuration', {
          responseType: 'blob',
        })
        .then((res: any) => {
          let filename = res.headers['content-disposition']
            .split('filename=')[1]
            .replace(/"/g, '');
          let URL = window.URL.createObjectURL(res.data);

          let link = document.createElement('a');
          link.href = URL;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(URL);
        })
        .catch((err) => {
          throw err;
        });
    },
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
    async upload(_: any, file: File) {
      return await api
        .post('/oem/v1/Configs/Configuration', file, {
          headers: { 'Content-Type': 'application/octet-stream' },
        })
        .catch((err) => {
          console.log(err.response);
          throw err.response;
        });
    },
  },
};

export default ConfigureManagementStore;
