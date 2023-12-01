import api from '@/store/api';
import { ReturnGetters, ActionContext } from '@/types/store';

const state = {
  pciInfo: [] as any[],
};
type State = typeof state;

const getters = {
  pciInfo: (state: State) => state.pciInfo,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setPciInfo: (state: State, pciInfo: Record<string, any>[]) => {
    state.pciInfo = pciInfo;
  },
};

type Multations = keyof typeof mutations;

const actionsNames = ['getHostStatus'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getPciInfo({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    await api
      .get('/redfish/v1/Systems/system/Oem')
      .then(
        ({
          data: {
            Oem: { PCIDeviceInformation },
          },
        }) => {
          let PCIInfoList = PCIDeviceInformation.map((item: any) => {
            return { PCIInfo: item };
          });
          commit('setPciInfo', PCIInfoList);
        }
      )
      .catch((err) => {
        throw err;
      });
  },
};

const PciStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default PciStore;
