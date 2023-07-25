import api from '@/store/api';
import i18n from '@/i18n';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  snmpManagers: [] as any[],
  managersToDelete: [] as any[],
  remoteServer: { Address: '', Port: 0 },
};
type State = typeof state;

const getters = {
  snmpManagers: (state: State) => state.snmpManagers,
  managersToDelete: (state: State) => state.managersToDelete,
  remoteServer: (state: State) => state.remoteServer,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setSnmpMangers: (
    state: State,
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
  addNewSNMPManager: (state: State) => {
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
  deleteManagerTableRow: (state: State, index: number) => {
    if (state.snmpManagers[index].path) {
      state.managersToDelete.push(state.snmpManagers[index].path);
    }
    state.snmpManagers.splice(index, 1);
  },
  updateManagersSettings: async (
    state: State,
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
};
type Multations = keyof typeof mutations;

const actionsNames = [
  'getManagerData',
  'addNewSNMPManager',
  'deleteManagerTableRow',
  'onDeleteManagerTableRow',
  'updateManagersSettings',
  'addManager',
  'deleteManager',
  'setManagerAddress',
  'setManagerPort',
  'getRemoteServer',
  'setRemoteAddress',
  'setRemotePort',
  'deleteServer',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getManagerData({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
  addNewSNMPManager({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    commit('addNewSNMPManager');
  },
  deleteManagerTableRow(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    index: any
  ) {
    commit('deleteManagerTableRow', index);
  },
  onDeleteManagerTableRow(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    row: any
  ) {
    dispatch('deleteManagerTableRow', row);
  },
  updateManagersSettings(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    snmpManagers: any
  ) {
    commit('updateManagersSettings', snmpManagers);
  },
  async addManager(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    payload: { address: any; port: string | number }
  ) {
    const data = JSON.stringify({ data: [payload.address, +payload.port] });
    return await api.post(
      '/xyz/openbmc_project/network/snmp/manager/action/Client',
      data,
      undefined
    );
  },
  async deleteManager(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    path: string
  ) {
    const data = JSON.stringify({ data: [] });
    return await api.post(path + '/action/Delete', data, undefined);
  },
  async setManagerAddress(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    payload: { address: any; path: string }
  ) {
    const data = JSON.stringify({ data: payload.address });
    return await api.put(payload.path + '/attr/Address', data);
  },
  async setManagerPort(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    payload: { port: string | number; path: string }
  ) {
    const data = JSON.stringify({ data: +payload.port });
    return await api.put(payload.path + '/attr/Port', data);
  },
  async getRemoteServer({
    state,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    await api
      .get('/xyz/openbmc_project/logging/config/remote')
      .then(({ data: { data } }) => {
        state.remoteServer.Address = data.Address;
        state.remoteServer.Port = data.Port;
      });
  },
  async setRemoteAddress(
    { state }: ActionContext<ActionNames, Multations, State, Getters>,
    payload: { Address: any }
  ) {
    const data = JSON.stringify({ data: payload.Address });
    return await api
      .put('/xyz/openbmc_project/logging/config/remote/attr/Address', data)
      .then(() => {
        state.remoteServer.Address = payload.Address;
      });
  },
  async setRemotePort(
    { state }: ActionContext<ActionNames, Multations, State, Getters>,
    payload: { Port: any }
  ) {
    const data = JSON.stringify({ data: payload.Port });
    return await api
      .put('/xyz/openbmc_project/logging/config/remote/attr/Port', data)
      .then(() => {
        state.remoteServer.Port = payload.Port;
      });
  },
  async deleteServer({
    dispatch,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    const payload = { Address: '', Port: 0 };
    dispatch('setRemoteAddress', payload);
    dispatch('setRemotePort', payload);
  },
};

const AlarmSettingStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default AlarmSettingStore;
