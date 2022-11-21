import api from '@/store/api';
import i18n from '@/i18n';

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

const VirtualMediaStore = {
  namespaced: true,
  state: {
    proxyDevices: [],
    legacyDevices: [],
    connections: [],
  },
  getters: {
    proxyDevices: (state: { proxyDevices: any }) => state.proxyDevices,
    legacyDevices: (state: { legacyDevices: any }) => state.legacyDevices,
  },
  mutations: {
    setProxyDevicesData: (state: { proxyDevices: any }, deviceData: any) =>
      (state.proxyDevices = deviceData),
    setLegacyDevicesData: (state: { legacyDevices: any }, deviceData: any) =>
      (state.legacyDevices = deviceData),
  },
  actions: {
    async getData({ commit }: any) {
      const virtualMediaListEnabled =
        process.env.VUE_APP_VIRTUAL_MEDIA_LIST_ENABLED === 'true'
          ? true
          : false;
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
    async mountImage(_: any, { id, data }: any) {
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
    async unmountImage(_: any, id: any) {
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
  },
};

export default VirtualMediaStore;
