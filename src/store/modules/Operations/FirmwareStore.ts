import api from '@/store/api';
import i18n from '@/i18n';

const FirmwareStore = {
  namespaced: true,
  state: {
    bmcFirmware: [],
    hostFirmware: [],
    bmcActiveFirmwareId: null,
    hostActiveFirmwareId: null,
    applyTime: null,
    tftpAvailable: false,
    updateProgress: 0,
    updateFirmware: '',
    lastGetProgress: 0,
  },
  getters: {
    isTftpUploadAvailable: (state: { tftpAvailable: any }) =>
      state.tftpAvailable,
    isSingleFileUploadEnabled: (state: { hostFirmware: string | any[] }) =>
      state.hostFirmware.length === 0,
    activeBmcFirmware: (state: {
      bmcFirmware: any[];
      bmcActiveFirmwareId: any;
    }) => {
      return state.bmcFirmware.find(
        (firmware: { id: any }) => firmware.id === state.bmcActiveFirmwareId
      );
    },
    activeHostFirmware: (state: {
      hostFirmware: any[];
      hostActiveFirmwareId: any;
    }) => {
      return state.hostFirmware.find(
        (firmware: { id: any }) => firmware.id === state.hostActiveFirmwareId
      );
    },
    backupBmcFirmware: (state: {
      bmcFirmware: any[];
      bmcActiveFirmwareId: any;
    }) => {
      return state.bmcFirmware.find(
        (firmware: { id: any }) => firmware.id !== state.bmcActiveFirmwareId
      );
    },
    backupHostFirmware: (state: {
      hostFirmware: any[];
      hostActiveFirmwareId: any;
    }) => {
      return state.hostFirmware.find(
        (firmware: { id: any }) => firmware.id !== state.hostActiveFirmwareId
      );
    },
  },
  mutations: {
    setActiveBmcFirmwareId: (state: { bmcActiveFirmwareId: any }, id: any) =>
      (state.bmcActiveFirmwareId = id),
    setActiveHostFirmwareId: (state: { hostActiveFirmwareId: any }, id: any) =>
      (state.hostActiveFirmwareId = id),
    setBmcFirmware: (state: { bmcFirmware: any }, firmware: any) =>
      (state.bmcFirmware = firmware),
    setHostFirmware: (state: { hostFirmware: any }, firmware: any) =>
      (state.hostFirmware = firmware),
    setApplyTime: (state: { applyTime: any }, applyTime: any) =>
      (state.applyTime = applyTime),
    setTftpUploadAvailable: (
      state: { tftpAvailable: any },
      tftpAvailable: any
    ) => (state.tftpAvailable = tftpAvailable),
  },
  actions: {
    async getFirmwareInformation({ dispatch }: any) {
      dispatch('getActiveHostFirmware');
      dispatch('getActiveBmcFirmware');
      return await dispatch('getFirmwareInventory');
    },
    getActiveBmcFirmware({ commit }: any) {
      return api
        .get('/redfish/v1/Managers/bmc')
        .then(({ data: { Links } }) => {
          const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
          commit('setActiveBmcFirmwareId', id);
        })
        .catch((error) => console.log(error));
    },
    getActiveHostFirmware({ commit }: any) {
      return api
        .get('/redfish/v1/Systems/system/Bios')
        .then(({ data: { Links } }) => {
          const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
          commit('setActiveHostFirmwareId', id);
        })
        .catch((error) => console.log(error));
    },
    async getFirmwareInventory({ commit }: any) {
      const inventoryList = await api
        .get('/redfish/v1/UpdateService/FirmwareInventory')
        .then(({ data: { Members = [] } = {} }) =>
          Members.map((item: { [x: string]: string }) =>
            api.get(item['@odata.id'])
          )
        )
        .catch((error) => console.log(error));
      await api
        .all(inventoryList)
        .then((response) => {
          const bmcFirmware: {
            version: any;
            id: any;
            location: any;
            status: any;
          }[] = [];
          const hostFirmware: {
            version: any;
            id: any;
            location: any;
            status: any;
          }[] = [];
          response.forEach(({ data }: any) => {
            const firmwareType = data?.RelatedItem?.[0]?.['@odata.id']
              .split('/')
              .pop();
            const item = {
              version: data?.Version,
              id: data?.Id,
              location: data?.['@odata.id'],
              status: data?.Status?.Health,
            };
            if (firmwareType === 'bmc') {
              bmcFirmware.push(item);
            } else if (firmwareType === 'Bios') {
              hostFirmware.push(item);
            }
          });
          commit('setBmcFirmware', bmcFirmware);
          commit('setHostFirmware', hostFirmware);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getUpdateServiceSettings({ commit }: any) {
      api
        .get('/redfish/v1/UpdateService')
        .then(({ data }) => {
          const applyTime =
            data.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
          const allowableActions =
            data?.Actions?.['#UpdateService.SimpleUpdate']?.[
              'TransferProtocol@Redfish.AllowableValues'
            ];

          commit('setApplyTime', applyTime);
          if (allowableActions?.includes('TFTP')) {
            commit('setTftpUploadAvailable', true);
          }
        })
        .catch((error) => console.log(error));
    },
    setApplyTimeImmediate({ commit }: any) {
      const data = {
        HttpPushUriOptions: {
          HttpPushUriApplyTime: {
            ApplyTime: 'Immediate',
          },
        },
      };
      return api
        .patch('/redfish/v1/UpdateService', data)
        .then(() => commit('setApplyTime', 'Immediate'))
        .catch((error) => console.log(error));
    },
    async uploadFirmware({ state, dispatch }: any, image: any) {
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch('setApplyTimeImmediate');
      }
      return await api
        .post('/redfish/v1/UpdateService', image, {
          headers: { 'Content-Type': 'application/octet-stream' },
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageFirmware.toast.errorUpdateFirmware') as string
          );
        });
    },
    async uploadFirmwareTFTP({ state, dispatch }: any, fileAddress: any) {
      const data = {
        TransferProtocol: 'TFTP',
        ImageURI: fileAddress,
      };
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch('setApplyTimeImmediate');
      }
      return await api
        .post(
          '/redfish/v1/UpdateService/Actions/UpdateService.SimpleUpdate',
          data,
          undefined
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageFirmware.toast.errorUpdateFirmware') as string
          );
        });
    },
    async switchBmcFirmwareAndReboot({ getters }: any) {
      const backupLocation = getters.backupBmcFirmware.location;
      const data = {
        Links: {
          ActiveSoftwareImage: {
            '@odata.id': backupLocation,
          },
        },
      };
      return await api
        .patch('/redfish/v1/Managers/bmc', data)
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageFirmware.toast.errorSwitchImages') as string
          );
        });
    },
    async getUpdateinfo({ state }: any, id: string) {
      return await api
        .get('/xyz/openbmc_project/software/' + id)
        .then(({ data: { data } }) => {
          if (data.Progress) {
            state.updateProgress = data.Progress;
          }
          return data;
        })
        .catch(() => {
          throw 'page not found!';
        });
    },
    async getFirmwareInfo(_: any, id: string) {
      return await api
        .get('/redfish/v1/UpdateService/FirmwareInventory/' + id)
        .then(({ data }) => {
          return data;
        });
    },
    async deleteBrokenFirmware(context: any, id: string) {
      const data = JSON.stringify({ data: [] });
      await api.post(
        '/xyz/openbmc_project/software/' + id + '/action/Delete',
        data,
        undefined
      );
    },
  },
};

export default FirmwareStore;
