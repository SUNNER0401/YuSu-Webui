import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  dimms: [] as any[],
};
type State = typeof state;

const getters = {
  dimms: (state: { dimms: any }) => state.dimms,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setMemoryInfo: (state: State, data: { data: any }[]) => {
    state.dimms = data.map(({ data }) => {
      const {
        Id,
        Status = {},
        PartNumber,
        SerialNumber,
        SparePartNumber,
        Description,
        MemoryType,
        CapacityMiB,
        LocationIndicatorActive,
        Location,
        OperatingSpeedMhz,
        Manufacturer,
      } = data;
      return {
        id: Id,
        health: Status.Health,
        partNumber: PartNumber,
        serialNumber: SerialNumber,
        statusState: Status.State,
        sparePartNumber: SparePartNumber,
        description: Description,
        memoryType: MemoryType,
        memorySize: CapacityMiB,
        identifyLed: LocationIndicatorActive,
        uri: data['@odata.id'],
        locationNumber: Location?.PartLocation?.ServiceLabel,
        operatingSpeedMhz: OperatingSpeedMhz,
        manufacturer: Manufacturer,
      };
    });
  },
};

type Multations = keyof typeof mutations;

const actionsNames = ['getDimms', 'updateIdentifyLedValue'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getDimms({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Systems/system/Memory')
      .then(({ data: { Members } }) => {
        const promises = Members.map((item: { [x: string]: string }) =>
          api.get(item['@odata.id'])
        );
        return api.all(promises);
      })
      .then((response) => commit('setMemoryInfo', response))
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
      dispatch('getDimms');
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

const MemoryStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default MemoryStore;
