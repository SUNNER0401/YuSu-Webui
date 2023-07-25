import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  assemblies: [] as any[],
};
type State = typeof state;

const getters = {
  assemblies: (state: State) => state.assemblies,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setAssemblyInfo: (state: State, data: any[]) => {
    state.assemblies = data.map(
      (assembly: {
        [x: string]: any;
        MemberId?: any;
        PartNumber?: any;
        SerialNumber?: any;
        SparePartNumber?: any;
        Model?: any;
        Name?: any;
        Location?: any;
        LocationIndicatorActive?: any;
      }) => {
        const {
          MemberId,
          PartNumber,
          SerialNumber,
          SparePartNumber,
          Model,
          Name,
          Location,
          LocationIndicatorActive,
        } = assembly;
        return {
          id: MemberId,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          sparePartNumber: SparePartNumber,
          model: Model,
          name: Name,
          locationNumber: Location?.PartLocation?.ServiceLabel,
          identifyLed: LocationIndicatorActive,
          uri: assembly['@odata.id'],
        };
      }
    );
  },
};
type Multations = keyof typeof mutations;

const actionsNames = ['getAssemblyInfo', 'updateIdentifyLedValue'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getAssemblyInfo({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Chassis/chassis/Assembly')
      .then(({ data }) => commit('setAssemblyInfo', data?.Assemblies))
      .catch((error) => console.log(error));
  },
  async updateIdentifyLedValue(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    led: { uri: any; identifyLed: any }
  ) {
    const uri = led.uri;
    const updatedIdentifyLedValue = {
      LocationIndicatorActive: led.identifyLed,
    };
    return await api.patch(uri, updatedIdentifyLedValue).catch((error) => {
      dispatch('getAssemblyInfo');
      console.log('error', error);
      if (led.identifyLed) {
        throw new Error(
          i18n.t('pageInventory.toast.errorEnableIdentifyLed') as string
        );
      } else {
        throw new Error(
          i18n.t('pageInventory.toast.errorDisableIdentifyLed') as string
        );
      }
    });
  },
};

const AssemblyStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default AssemblyStore;
