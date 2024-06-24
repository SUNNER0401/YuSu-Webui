import api from '@/store/api';

interface ChassisManageState {
  chassisManageValue: any;
}

const ChassisManageStore = {
  namespaced: true,
  state: {
    chassisManageValue: {},
  } as ChassisManageState,
  getters: {
    chassisManageValue: (state: ChassisManageState) => state.chassisManageValue,
  },
  mutations: {
    setChassisManageValue: (
      state: ChassisManageState,
      ChassisManageValue: any
    ) => {
      state.chassisManageValue = ChassisManageValue;
    },
  },
  actions: {
    // 获取机箱管理信息
    getChassisManageValue({ commit }: any) {
      return api
        .get('/redfish/v1/ChassisManage')
        .then((response) => {
          commit('setChassisManageValue', response.data);
        })
        .catch((error) => console.log(error))
        .finally();
    },
  },
};

export default ChassisManageStore;
