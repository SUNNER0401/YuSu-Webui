import api from '@/store/api';
import i18n from '@/i18n';

const ProcessorStore = {
  namespaced: true,
  state: {
    processors: [],
  },
  getters: {
    processors: (state: { processors: any }) => state.processors,
  },
  mutations: {
    setProcessorsInfo: (state: { processors: any }, data: any[]) => {
      state.processors = data.map(
        (processor: {
          [x: string]: any;
          Id?: any;
          Status?: any;
          PartNumber?: any;
          SerialNumber?: any;
          SparePartNumber?: any;
          InstructionSet?: any;
          Manufacturer?: any;
          Model?: any;
          Name?: any;
          ProcessorArchitecture?: any;
          ProcessorType?: any;
          Version?: any;
          AssetTag?: any;
          MinSpeedMHz?: any;
          MaxSpeedMHz?: any;
          TotalCores?: any;
          TotalThreads?: any;
          Location?: any;
          LocationIndicatorActive?: any;
        }) => {
          const {
            Id,
            Status = {},
            PartNumber,
            SerialNumber,
            SparePartNumber,
            InstructionSet,
            Manufacturer,
            Model,
            Name,
            ProcessorArchitecture,
            ProcessorType,
            Version,
            AssetTag,
            MinSpeedMHz,
            MaxSpeedMHz,
            TotalCores,
            TotalThreads,
            Location,
            LocationIndicatorActive,
          } = processor;
          return {
            id: Id,
            health: Status.Health,
            healthRollup: Status.HealthRollup,
            partNumber: PartNumber,
            sparePartNumber: SparePartNumber,
            serialNumber: SerialNumber,
            statusState: Status.State,
            instructionSet: InstructionSet,
            manufacturer: Manufacturer,
            model: Model,
            name: Name,
            processorArchitecture: ProcessorArchitecture,
            processorType: ProcessorType,
            version: Version,
            assetTag: AssetTag,
            minSpeedMHz: MinSpeedMHz,
            maxSpeedMHz: MaxSpeedMHz,
            totalCores: TotalCores,
            totalThreads: TotalThreads,
            locationNumber: Location?.PartLocation?.ServiceLabel,
            identifyLed: LocationIndicatorActive,
            uri: processor['@odata.id'],
          };
        }
      );
    },
  },
  actions: {
    async getProcessorsInfo({ commit }: any) {
      return await api
        .get('/redfish/v1/Systems/system/Processors')
        .then(({ data: { Members = [] } }) =>
          Members.map((member: { [x: string]: string }) =>
            api.get(member['@odata.id'])
          )
        )
        .then((promises) => api.all(promises))
        .then((response: any) => {
          const data = response.map(({ data }: { data: string }) => data);
          commit('setProcessorsInfo', data);
        })
        .catch((error) => console.log(error));
    },
    // Waiting for the following to be merged to test the Identify Led:
    // https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/37045
    async updateIdentifyLedValue(
      { dispatch }: any,
      led: { uri: any; identifyLed: any }
    ) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api.patch(uri, updatedIdentifyLedValue).catch((error) => {
        dispatch('getProcessorsInfo');
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

export default ProcessorStore;
