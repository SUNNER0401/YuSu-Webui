import api from '@/store/api';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  sensorInfo: [],
};
type State = typeof state;

const getters = {
  sensorInfo: (state: State) => state.sensorInfo,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setInfo(state: any, info: { [index: string]: any }) {
    state.sensorInfo = info.Sensor;
  },
};

type Multations = keyof typeof mutations;

const actionsNames = [
  'download',
  'getConfigures',
  'UpdateSensorConfigure',
  'upload',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
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
  async getConfigures({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
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
  async upload(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    file: File
  ) {
    return await api
      .post('/oem/v1/Configs/Configuration', file, {
        headers: { 'Content-Type': 'application/octet-stream' },
      })
      .catch((err) => {
        console.log(err.response);
        throw err.response;
      });
  },
};

const ConfigureManagementStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default ConfigureManagementStore;
