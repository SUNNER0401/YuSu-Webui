import api from '@/store/api';

const PowerSupplyStore = {
  namespaced: true,
  state: {
    powerSupplies: [],
  },
  getters: {
    powerSupplies: (state: { powerSupplies: any }) => state.powerSupplies,
  },
  mutations: {
    setPowerSupply: (state: { powerSupplies: any }, data: any[]) => {
      state.powerSupplies = data.map(
        (powerSupply: {
          EfficiencyPercent: any;
          FirmwareVersion: any;
          LocationIndicatorActive: any;
          MemberId: any;
          Manufacturer: any;
          Model: any;
          Name: any;
          PartNumber: any;
          PowerInputWatts: any;
          SerialNumber: any;
          SparePartNumber: any;
          Location: any;
          Status?: { [index: string]: string } | undefined;
        }) => {
          const {
            EfficiencyPercent,
            FirmwareVersion,
            LocationIndicatorActive,
            MemberId,
            Manufacturer,
            Model,
            Name,
            PartNumber,
            PowerInputWatts,
            SerialNumber,
            SparePartNumber,
            Location,
            Status = {},
          } = powerSupply;
          return {
            id: MemberId,
            health: Status.Health,
            partNumber: PartNumber,
            serialNumber: SerialNumber,
            efficiencyPercent: EfficiencyPercent,
            firmwareVersion: FirmwareVersion,
            identifyLed: LocationIndicatorActive,
            manufacturer: Manufacturer,
            model: Model,
            powerInputWatts: PowerInputWatts,
            name: Name,
            sparePartNumber: SparePartNumber,
            locationNumber: Location?.PartLocation?.ServiceLabel,
            statusState: Status.State,
          };
        }
      );
    },
  },
  actions: {
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member: { [x: string]: any }) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getAllPowerSupplies({ dispatch, commit }: any) {
      const collection = await dispatch('getChassisCollection');
      if (!collection) return;
      return await api
        .all(
          collection.map((chassis: any) => dispatch('getChassisPower', chassis))
        )
        .then((supplies: any) => {
          let suppliesList: any[] = [];
          supplies.forEach(
            (supply: any) => (suppliesList = [...suppliesList, ...supply])
          );
          commit('setPowerSupply', suppliesList);
        })
        .catch((error) => console.log(error));
    },
    async getChassisPower(_: any, id: any) {
      return await api
        .get(`${id}/Power`)
        .then(({ data: { PowerSupplies } }) => PowerSupplies || [])
        .catch((error) => console.log(error));
    },
  },
};

export default PowerSupplyStore;
