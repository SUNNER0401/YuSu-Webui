import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  bmcFirmware: [],
  hostFirmware: [],
  bmcActiveFirmwareId: null,
  hostActiveFirmwareId: null,
  applyTime: null,
  tftpAvailable: false,
  updateProgress: 0,
};
type State = typeof state;

const getters = {
  isTftpUploadAvailable: (state: State) => state.tftpAvailable,
  isSingleFileUploadEnabled: (state: State) => state.hostFirmware.length === 0,
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
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setActiveBmcFirmwareId: (state: State, id: any) =>
    (state.bmcActiveFirmwareId = id),
  setActiveHostFirmwareId: (state: State, id: any) =>
    (state.hostActiveFirmwareId = id),
  setBmcFirmware: (state: State, firmware: any) =>
    (state.bmcFirmware = firmware),
  setHostFirmware: (state: State, firmware: any) =>
    (state.hostFirmware = firmware),
  setApplyTime: (state: State, applyTime: any) => (state.applyTime = applyTime),
  setTftpUploadAvailable: (state: State, tftpAvailable: any) =>
    (state.tftpAvailable = tftpAvailable),
  setUpdateProgress: (state: State, updateProgress: any) =>
    (state.updateProgress = updateProgress),
};
type Multations = keyof typeof mutations;

const actionsNames = [
  'getFirmwareInformation',
  'getActiveBmcFirmware',
  'getActiveHostFirmware',
  'getFirmwareInventory',
  'getUpdateServiceSettings',
  'setApplyTimeOnReset',
  'uploadFirmware',
  'uploadFirmwareTFTP',
  'switchBmcFirmwareAndReboot',
  'getUpdateinfo',
  'getFirmwareInfo',
  'deleteBrokenFirmware',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getFirmwareInformation({
    dispatch,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    await api
      .all([
        dispatch('getActiveHostFirmware'),
        dispatch('getActiveBmcFirmware'),
      ])
      .then(async () => {
        await dispatch('getFirmwareInventory');
      });
  },
  getActiveBmcFirmware({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return api
      .get('/redfish/v1/Managers/bmc')
      .then(({ data: { Links } }) => {
        const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
        commit('setActiveBmcFirmwareId', id);
      })
      .catch((error) => console.log(error));
  },
  getActiveHostFirmware({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return api
      .get('/redfish/v1/Systems/system/Bios')
      .then(({ data: { Links } }) => {
        const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
        commit('setActiveHostFirmwareId', id);
      })
      .catch((error) => console.log(error));
  },
  async getFirmwareInventory({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
  getUpdateServiceSettings({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
  setApplyTimeOnReset({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    const data = {
      HttpPushUriOptions: {
        HttpPushUriApplyTime: {
          ApplyTime: 'OnReset',
        },
      },
    };
    return api
      .patch('/redfish/v1/UpdateService', data)
      .then(() => commit('setApplyTime', 'OnReset'))
      .catch((error) => console.log(error));
  },
  async uploadFirmware(
    { state, dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    image: any
  ) {
    if (state.applyTime !== 'OnReset') {
      // ApplyTime must be set to OnReset before making
      // request to update firmware
      await dispatch('setApplyTimeOnReset');
    }
    return await api
      .post('/redfish/v1/UpdateService', image, {
        headers: { 'Content-Type': 'application/octet-stream' },
      })
      .then(async ({ data }) => {
        const { Type: type, '@odata.id': taskUrl } = data;
        return {
          type,
          taskUrl,
        };
      })
      .catch(() => {
        throw new Error(
          i18n.t('pageFirmware.toast.errorUpdateFirmware') as string
        );
      });
  },
  async uploadFirmwareTFTP(
    { state, dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    fileAddress: any
  ) {
    const data = {
      TransferProtocol: 'TFTP',
      ImageURI: fileAddress,
    };
    if (state.applyTime !== 'OnReset') {
      // ApplyTime must be set to OnReset before making
      // request to update firmware
      await dispatch('setApplyTimeOnReset');
    }
    return await api
      .post(
        '/redfish/v1/UpdateService/Actions/UpdateService.SimpleUpdate',
        data,
        undefined
      )
      .then(async ({ data }) => {
        const { Type: type, '@odata.id': taskUrl } = data;
        return {
          type,
          taskUrl,
        };
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageFirmware.toast.errorUpdateFirmware') as string
        );
      });
  },
  async switchBmcFirmwareAndReboot({
    getters,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    const backupLocation = getters.backupBmcFirmware.location;
    const data = {
      Links: {
        ActiveSoftwareImage: {
          '@odata.id': backupLocation,
        },
      },
    };
    return await api.patch('/redfish/v1/Managers/bmc', data).catch((error) => {
      console.log(error);
      throw new Error(i18n.t('pageFirmware.toast.errorSwitchImages') as string);
    });
  },
  async getUpdateinfo(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    taskUrl: string
  ) {
    return await api
      .get(taskUrl)
      .then(({ data: { TaskState, PercentComplete } }) => {
        commit('setUpdateProgress', PercentComplete);
        return { TaskState };
      })
      .catch(() => {
        throw 'page not found!';
      });
  },
  async getFirmwareInfo(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    id: string
  ) {
    return await api
      .get('/redfish/v1/UpdateService/FirmwareInventory/' + id)
      .then(({ data }) => {
        return data;
      });
  },
  async deleteBrokenFirmware(
    context: ActionContext<ActionNames, Multations, State, Getters>,
    id: string
  ) {
    const data = JSON.stringify({ data: [] });
    await api.post(
      '/xyz/openbmc_project/software/' + id + '/action/Delete',
      data,
      undefined
    );
  },
};

const FirmwareStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default FirmwareStore;
