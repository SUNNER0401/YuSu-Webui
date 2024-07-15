import api from '@/store/api';

interface PowerManageStore {
  currentStatus: '';
}

const PowerManageStore = {
  namespaced: true,
  state: {
    currentStatus: '',
  } as PowerManageStore,
  getters: {},
  mutations: {},
  actions: {
    powerOpen() {
      return api
        .get('/redfish/v1/poweron')
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.log(error))
        .finally();
    },
    powerClose() {
      return api
        .get('/redfish/v1/powerclose')
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.log(error))
        .finally();
    },
    reboot() {
      return api
        .get('/redfish/v1/reboot')
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.log(error))
        .finally();
    },
    vga() {
      return api
        .get('/redfish/v1/vga')
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.log(error))
        .finally();
    },
  },
};

export default PowerManageStore;
