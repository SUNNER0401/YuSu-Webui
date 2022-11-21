import api from '@/store/api';
import i18n from '@/i18n';

const ChassisStore = {
  namespaced: true,
  state: {
    chassis: [],
  },
  getters: {
    chassis: (state: { chassis: any }) => state.chassis,
  },
  mutations: {
    setChassisInfo: (state: { chassis: any }, data: any[]) => {
      state.chassis = data.map(
        (chassis: {
          [x: string]: any;
          Id?: any;
          Status?: any;
          PartNumber?: any;
          SerialNumber?: any;
          ChassisType?: any;
          Manufacturer?: any;
          PowerState?: any;
          LocationIndicatorActive?: any;
          AssetTag?: any;
          MaxPowerWatts?: any;
          MinPowerWatts?: any;
          Name?: any;
          Location?: any;
          Model?: any;
        }) => {
          const {
            Id,
            Status = {},
            PartNumber,
            SerialNumber,
            ChassisType,
            Manufacturer,
            PowerState,
            LocationIndicatorActive,
            AssetTag,
            MaxPowerWatts,
            MinPowerWatts,
            Name,
            Location,
            Model,
          } = chassis;

          return {
            id: Id,
            health: Status.Health,
            partNumber: PartNumber,
            serialNumber: SerialNumber,
            chassisType: ChassisType,
            manufacturer: Manufacturer,
            powerState: PowerState,
            statusState: Status.State,
            healthRollup: Status.HealthRollup,
            assetTag: AssetTag,
            maxPowerWatts: MaxPowerWatts,
            minPowerWatts: MinPowerWatts,
            name: Name,
            identifyLed: LocationIndicatorActive,
            uri: chassis['@odata.id'],
            locationNumber: Location?.PartLocation?.ServiceLabel,
            model: Model,
          };
        }
      );
    },
  },
  actions: {
    async getChassisInfo({ commit }: any) {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members = [] } }) =>
          Members.map((member: { [x: string]: string }) =>
            api.get(member['@odata.id'])
          )
        )
        .then((promises) => api.all(promises))
        .then((response: any) => {
          const data = response.map(({ data }: any) => data);
          commit('setChassisInfo', data);
        })
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
      return await api
        .patch(uri, updatedIdentifyLedValue)
        .then(() => dispatch('getChassisInfo'))
        .catch((error) => {
          dispatch('getChassisInfo');
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

export default ChassisStore;
