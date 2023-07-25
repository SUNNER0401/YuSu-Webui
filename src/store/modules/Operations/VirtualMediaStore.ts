import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const transferProtocolType = {
  CIFS: 'CIFS',
  FTP: 'FTP',
  SFTP: 'SFTP',
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  NFS: 'NFS',
  SCP: 'SCP',
  TFTP: 'TFTP',
  OEM: 'OEM',
};

const state = {
  proxyDevices: [],
  legacyDevices: [],
  connections: [],
};
type State = typeof state;

const getters = {
  proxyDevices: (state: State) => state.proxyDevices,
  legacyDevices: (state: State) => state.legacyDevices,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setProxyDevicesData: (state: State, deviceData: any) =>
    (state.proxyDevices = deviceData),
  setLegacyDevicesData: (state: State, deviceData: any) =>
    (state.legacyDevices = deviceData),
};

type Multations = keyof typeof mutations;

const actionsNames = ['getData', 'mountImage', 'unmountImage'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getData({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    const virtualMediaListEnabled =
      process.env.VUE_APP_VIRTUAL_MEDIA_LIST_ENABLED === 'true' ? true : false;
    let webDevice: boolean | { [index: string]: any } = false;
    webDevice = {
      id: i18n.t('pageVirtualMedia.defaultDeviceName'),
      websocket: '/vm/0/0',
      file: null,
      transferProtocolType: transferProtocolType.OEM,
      isActive: false,
    };
    if (!virtualMediaListEnabled) {
      commit('setProxyDevicesData', [webDevice]);
      return;
    }

    return await api
      .get('/redfish/v1/Managers/bmc/VirtualMedia')
      .then((response) =>
        response.data.Members.map(
          (virtualMedia: { [x: string]: any }) => virtualMedia['@odata.id']
        )
      )
      .then((devices) =>
        api.all(devices.map((device: string) => api.get(device)))
      )
      .then((devices: any) => {
        const deviceData = devices.map(
          (device: {
            data: {
              Inserted: boolean;
              Id: any;
              TransferProtocolType: any;
              Oem: { OpenBMC: { WebSocketEndpoint: any } };
            };
          }) => {
            const isActive = device.data?.Inserted === true ? true : false;
            return {
              id: device.data?.Id,
              transferProtocolType: device.data?.TransferProtocolType,
              websocket: device.data?.Oem?.OpenBMC?.WebSocketEndpoint,
              isActive: isActive,
            };
          }
        );
        const proxyDevices = deviceData
          .filter(
            (d: { transferProtocolType: string }) =>
              d.transferProtocolType === transferProtocolType.OEM
          )
          .map((device: any[]) => {
            return {
              ...device,
              file: null,
            };
          });
        const legacyDevices = deviceData
          .filter(
            (d: { transferProtocolType: string }) =>
              d.transferProtocolType !== transferProtocolType.OEM
          )
          .map((device: any) => {
            return {
              ...device,
              serverUri: '',
              username: '',
              password: '',
              isRW: false,
            };
          });
        commit('setProxyDevicesData', [...proxyDevices, webDevice]);
        commit('setLegacyDevicesData', legacyDevices);
      })
      .catch((error) => {
        commit('setProxyDevicesData', [webDevice]);
        console.log('Virtual Media:', error);
      });
  },
  async mountImage(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    { id, data }: any
  ) {
    return await api
      .post(
        `/redfish/v1/Managers/bmc/VirtualMedia/${id}/Actions/VirtualMedia.InsertMedia`,
        data,
        undefined
      )
      .catch((error) => {
        console.log('Mount image:', error);
        throw new Error();
      });
  },
  async unmountImage(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    id: any
  ) {
    return await api
      .post(
        `/redfish/v1/Managers/bmc/VirtualMedia/${id}/Actions/VirtualMedia.EjectMedia`,
        undefined,
        undefined
      )
      .catch((error) => {
        console.log('Unmount image:', error);
        throw new Error();
      });
  },
};

const VirtualMediaStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default VirtualMediaStore;
