import api from '@/store/api';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  pcieDevices: [] as any[],
};
type State = typeof state;

const getters = {
  pcieDevices: (state: State) => state.pcieDevices,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setPcieInfo: (state: State, pcieDevices: Record<string, any>[]) => {
    state.pcieDevices = pcieDevices;
  },
};

type Multations = keyof typeof mutations;

const actionsNames = ['getHostStatus'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getPcieInfo({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    const pcieDevices: Record<string, any>[] = [];
    await api
      .get('/redfish/v1/Systems/system/PCIeDevices')
      .then(({ data: { Members } }) => {
        const promises = Members.map((item: { [x: string]: any }) =>
          api.get(item['@odata.id'])
        );
        return api.all(promises);
      })
      .then(async (response: any) => {
        let promises: any = [];
        response.forEach(
          async ({
            data,
          }: {
            data: {
              [index: string]: string | Record<string, any>;
              PCIeFunctions: {
                '@odata.id': string;
              };
            };
          }) => {
            let pcieDevice: Record<string, any> = {};
            pcieDevice.id = data.Id;
            pcieDevice.name = data.Name;
            pcieDevice.deviceType = data.DeviceType;
            pcieDevice.details = [];
            let promise = api
              .get(data.PCIeFunctions['@odata.id'])
              .then(async ({ data: { Members } }) => {
                // Get details of each function.
                let promises: any = [];
                Members.map((item: { '@odata.id': string }) => {
                  let promise = api
                    .get(item['@odata.id'])
                    .then(({ data }: { data: Record<string, string> }) => {
                      const {
                        FunctionId,
                        DeviceId,
                        ClassCode,
                        VendorId,
                        FunctionType,
                        SubsystemId,
                        RevisionId,
                        SubsystemVendorId,
                        DeviceClass,
                      } = data;
                      let detail = {
                        deviceClass: DeviceClass,
                        functionId: FunctionId,
                        deviceId: DeviceId,
                        classCode: ClassCode,
                        vendorID: VendorId,
                        functionType: FunctionType,
                        subsystemId: SubsystemId,
                        revisionId: RevisionId,
                        subsystemVendorID: SubsystemVendorId,
                      };
                      pcieDevice.details.push(detail);
                    });
                  promises.push(promise);
                });
                await api.all(promises);
              });
            promises.push(promise);
            pcieDevices.push(pcieDevice);
          }
        );
        await api.all(promises);
      })
      .catch((error: any) => console.log(error));
    commit('setPcieInfo', pcieDevices);
  },
};

const PcieStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default PcieStore;
