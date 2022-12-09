import api from '@/store/api';
import i18n from '@/i18n';

const MemoryStore = {
  namespaced: true,
  state: {
    dimms: [],
  },
  getters: {
    dimms: (state: { dimms: any }) => state.dimms,
  },
  mutations: {
    setMemoryInfo: (state: { dimms: any }, data: { data: any }[]) => {
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
        };
      });
    },
  },
  actions: {
    async getDimms({ commit }: any) {
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
      { dispatch }: any,
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
  },
};

export default MemoryStore;
