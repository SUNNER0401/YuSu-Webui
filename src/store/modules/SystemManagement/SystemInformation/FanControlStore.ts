import api from '@/store/api';

interface FanControlState {
  currentFanSpeed: string;
  fanSpeedWanted: string | null;
  currentFanPattern: string;
  message: string;
}

const FanControlStore = {
  namespaced: true,
  state: {
    currentFanSpeed: '****',
    fanSpeedWanted: null,
    currentFanPattern: 'auto',
    message: '****',
  } as FanControlState,
  getters: {
    currentFanSpeed: (state: FanControlState) => state.currentFanSpeed,
    currentFanPattern: (state: FanControlState) => state.currentFanPattern,
    fanSpeedWanted: (state: FanControlState) => state.fanSpeedWanted,
    message: (state: FanControlState) => state.message,
  },
  mutations: {
    setCurrentFanSpeed: (state: FanControlState, currentFanSpeed: string) => {
      state.currentFanSpeed = currentFanSpeed;
    },
    setFanSpeedWanted: (state: FanControlState, fanSpeedWanted: string) => {
      state.fanSpeedWanted = fanSpeedWanted;
      console.log('current fanSpeedWanted is', fanSpeedWanted);
    },
    setMessage: (state: FanControlState, message: string) => {
      state.message = message;
    },
    setCurrentFanPattern: (state: FanControlState, currentFanPattern: string) =>
      (state.currentFanPattern = currentFanPattern),
  },
  actions: {
    getFanSpeed({ commit }: any) {
      console.log('watch get fan speed time');
      let fanSpeed = '';
      return api
        .get('/redfish/v1/Managers/fan')
        .then((response) => {
          Object.keys(response.data).forEach((key) => {
            fanSpeed += key;
            fanSpeed += ':';
            fanSpeed += response.data[key].Value;
            fanSpeed += ' ';
          });
          commit('setCurrentFanSpeed', fanSpeed);
        })
        .catch((error) => console.log(error))
        .finally();
    },

    getFanModal({ commit }: any) {
      return api
        .get('/redfish/v1/Managers/fan/model/')
        .then((response) => {
          commit('setCurrentFanPattern', response.data.fanModel);
        })
        .catch((error) => console.log(error))
        .finally();
    },

    postAutoControlFanSpeed({ commit, dispatch }: any) {
      return api
        .post('/redfish/v1/Managers/fan', {
          fanvalue: '',
          fanModel: 'auto',
        })
        .then((response) => {
          if (response.data.status == 'ok') {
            commit('setMessage', response.data.message);
          }
        })
        .then(() => {
          setTimeout(() => {
            dispatch('getFanSpeed');
            dispatch('getFanModal');
          }, 2000);
        })
        .catch((error) => console.log(error))
        .finally();
    },

    postManualControlFanSpeed({ state, commit, dispatch }: any) {
      return api
        .post('/redfish/v1/Managers/fan', {
          fanvalue: state.fanSpeedWanted,
          fanModel: 'manual',
        })
        .then((response) => {
          if (response.data.status == 'ok') {
            commit('setMessage', response.data.message);
          }
        })
        .then(() => {
          dispatch('getFanSpeed');
          dispatch('getFanModal');
        })
        .catch((error) => console.log(error))
        .finally();
    },
  },
};

export default FanControlStore;
