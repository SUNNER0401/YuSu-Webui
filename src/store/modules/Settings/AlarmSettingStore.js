import api from '@/store/api';
import i18n from '@/i18n';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

const AlarmSettingStore = {
  namespaced: true,
  state: {
    snmpManagers: [],
    managersToDelete: [],
    remoteServer: { Address: '', Port: 0 },
  },
  getters: {
    snmpManagers: (state) => state.snmpManagers,
    managersToDelete: (state) => state.managersToDelete,
    remoteServer: (state) => state.remoteServer,
  },
  mutations: {
    setSnmpMangers: (state, snmpManagers) => {
      for (var key in snmpManagers) {
        state.snmpManagers.push({
          path: key,
          port: snmpManagers[key].Port,
          updatePort: false,
          address: snmpManagers[key].Address,
          updateAddress: false,
          actions: [
            {
              value: 'delete',
              title: i18n.t('pageNetwork.table.deleteDns'),
            },
          ],
        });
      }
    },
    addNewSNMPManager: (state) => {
      state.snmpManagers.push({
        address: '',
        port: '',
        actions: [
          {
            value: 'delete',
            title: i18n.t('pageNetwork.table.deleteDns'),
          },
        ],
      });
    },
    deleteManagerTableRow: (state, index) => {
      if (state.snmpManagers[index].path) {
        state.managersToDelete.push(state.snmpManagers[index].path);
      }
      state.snmpManagers.splice(index, 1);
    },
    updateManagersSettings: async (state, snmpManagers) => {
      // Validate that no field are empty and port is valid. Port value is
      // undefined if it is an invalid number.
      for (let i in snmpManagers) {
        if (!snmpManagers[i].address || !snmpManagers[i].port) {
          //   toastService.error('Cannot save. Please resolve errors on page.');
          BVToastMixin.methods.successToast(
            'Cannot save. Please resolve errors on page.'
          );
          return;
        }
      }
    },
  },
  actions: {
    async getManagerData({ commit }) {
      return await api
        .get('/xyz/openbmc_project/network/snmp/manager/enumerate')
        .then((response) => {
          let snmpManagers = response.data.data;
          commit('setSnmpMangers', snmpManagers);
          return snmpManagers;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    addNewSNMPManager({ commit }) {
      commit('addNewSNMPManager');
    },
    deleteManagerTableRow({ commit }, index) {
      commit('deleteManagerTableRow', index);
    },
    onDeleteManagerTableRow({ dispatch }, row) {
      dispatch('deleteManagerTableRow', row);
    },
    updateManagersSettings({ commit }, snmpManagers) {
      commit('updateManagersSettings', snmpManagers);
    },
    async addManager(context, payload) {
      const data = JSON.stringify({ data: [payload.address, +payload.port] });
      return await api.post(
        '/xyz/openbmc_project/network/snmp/manager/action/Client',
        data
      );
    },
    async deleteManager(context, path) {
      const data = JSON.stringify({ data: [] });
      return await api.post(path + '/action/Delete', data);
    },
    async setManagerAddress(context, payload) {
      const data = JSON.stringify({ data: payload.address });
      return await api.put(payload.path + '/attr/Address', data);
    },
    async setManagerPort(context, payload) {
      const data = JSON.stringify({ data: +payload.port });
      return await api.put(payload.path + '/attr/Port', data);
    },
    async getRemoteServer({ state }) {
      await api
        .get('/xyz/openbmc_project/logging/config/remote')
        .then(({ data: { data } }) => {
          state.remoteServer.Address = data.Address;
          state.remoteServer.Port = data.Port;
        });
    },
    async setRemoteAddress({ state }, payload) {
      const data = JSON.stringify({ data: payload.Address });
      return await api
        .put('/xyz/openbmc_project/logging/config/remote/attr/Address', data)
        .then(() => {
          state.remoteServer.Address = payload.Address;
        });
    },
    async setRemotePort({ state }, payload) {
      const data = JSON.stringify({ data: payload.Port });
      return await api
        .put('/xyz/openbmc_project/logging/config/remote/attr/Port', data)
        .then(() => {
          state.remoteServer.Port = payload.Port;
        });
    },
    async deleteServer({ dispatch }) {
      const payload = { Address: '', Port: 0 };
      dispatch('setRemoteAddress', payload);
      dispatch('setRemotePort', payload);
    },
  },
};

export default AlarmSettingStore;
