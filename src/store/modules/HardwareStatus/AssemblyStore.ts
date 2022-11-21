import api from '@/store/api';
import i18n from '@/i18n';

const AssemblyStore = {
  namespaced: true,
  state: {
    assemblies: null,
  },
  getters: {
    assemblies: (state: { assemblies: any }) => state.assemblies,
  },
  mutations: {
    setAssemblyInfo: (state: { assemblies: any }, data: any[]) => {
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
  },
  actions: {
    async getAssemblyInfo({ commit }: any) {
      return await api
        .get('/redfish/v1/Chassis/chassis/Assembly')
        .then(({ data }) => commit('setAssemblyInfo', data?.Assemblies))
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
  },
};

export default AssemblyStore;
