import api from '@/store/api';
import i18n from '@/i18n';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VueI18n from 'vue-i18n';

const AlarmSettingStore = {
  namespaced: true,
  state: {
    snmpManagers: [],
    managersToDelete: [],
    remoteServer: { Address: '', Port: 0 },
  },
  getters: {
    snmpManagers: (state: { snmpManagers: any }) => state.snmpManagers,
    managersToDelete: (state: { managersToDelete: any }) =>
      state.managersToDelete,
    remoteServer: (state: { remoteServer: any }) => state.remoteServer,
  },
  mutations: {
    setSnmpMangers: (
      state: {
        snmpManagers: {
          path: string;
          port: any;
          updatePort: boolean;
          address: any;
          updateAddress: boolean;
          actions: { value: string; title: VueI18n.TranslateResult }[];
        }[];
      },
      snmpManagers: { [x: string]: { Address: any; Port: number } }
    ) => {
      for (let key in snmpManagers) {
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
    addNewSNMPManager: (state: {
      snmpManagers: {
        address: string;
        port: string;
        actions: { value: string; title: VueI18n.TranslateResult }[];
      }[];
    }) => {
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
    deleteManagerTableRow: (
      state: { snmpManagers: any[]; managersToDelete: any[] },
      index: number
    ) => {
      if (state.snmpManagers[index].path) {
        state.managersToDelete.push(state.snmpManagers[index].path);
      }
      state.snmpManagers.splice(index, 1);
    },
    updateManagersSettings: async (
      state: any,
      snmpManagers: { [x: string]: { address: string; port: number } }
    ) => {
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
    async getManagerData({ commit }: any) {
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
    addNewSNMPManager({ commit }: any) {
      commit('addNewSNMPManager');
    },
    deleteManagerTableRow({ commit }: any, index: any) {
      commit('deleteManagerTableRow', index);
    },
    onDeleteManagerTableRow({ dispatch }: any, row: any) {
      dispatch('deleteManagerTableRow', row);
    },
    updateManagersSettings({ commit }: any, snmpManagers: any) {
      commit('updateManagersSettings', snmpManagers);
    },
    async addManager(
      context: any,
      payload: { address: any; port: string | number }
    ) {
      const data = JSON.stringify({ data: [payload.address, +payload.port] });
      return await api.post(
        '/xyz/openbmc_project/network/snmp/manager/action/Client',
        data,
        undefined
      );
    },
    async deleteManager(context: any, path: string) {
      const data = JSON.stringify({ data: [] });
      return await api.post(path + '/action/Delete', data, undefined);
    },
    async setManagerAddress(
      context: any,
      payload: { address: any; path: string }
    ) {
      const data = JSON.stringify({ data: payload.address });
      return await api.put(payload.path + '/attr/Address', data);
    },
    async setManagerPort(
      context: any,
      payload: { port: string | number; path: string }
    ) {
      const data = JSON.stringify({ data: +payload.port });
      return await api.put(payload.path + '/attr/Port', data);
    },
    async getRemoteServer({ state }: any) {
      await api
        .get('/xyz/openbmc_project/logging/config/remote')
        .then(({ data: { data } }) => {
          state.remoteServer.Address = data.Address;
          state.remoteServer.Port = data.Port;
        });
    },
    async setRemoteAddress({ state }: any, payload: { Address: any }) {
      const data = JSON.stringify({ data: payload.Address });
      return await api
        .put('/xyz/openbmc_project/logging/config/remote/attr/Address', data)
        .then(() => {
          state.remoteServer.Address = payload.Address;
        });
    },
    async setRemotePort({ state }: any, payload: { Port: any }) {
      const data = JSON.stringify({ data: payload.Port });
      return await api
        .put('/xyz/openbmc_project/logging/config/remote/attr/Port', data)
        .then(() => {
          state.remoteServer.Port = payload.Port;
        });
    },
    async deleteServer({ dispatch }: any) {
      const payload = { Address: '', Port: 0 };
      dispatch('setRemoteAddress', payload);
      dispatch('setRemotePort', payload);
    },
  },
};

export default AlarmSettingStore;
