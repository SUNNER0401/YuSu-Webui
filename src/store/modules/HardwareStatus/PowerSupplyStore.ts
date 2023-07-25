import api from '@/store/api';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  powerSupplies: [] as any[],
};
type State = typeof state;

const getters = {
  powerSupplies: (state: State) => state.powerSupplies,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setPowerSupply: (state: State, data: any[]) => {
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
};

type Multations = keyof typeof mutations;

const actionsNames = [
  'getChassisCollection',
  'getAllPowerSupplies',
  'getChassisPower',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getChassisCollection() {
    return await api
      .get('/redfish/v1/Chassis')
      .then(({ data: { Members } }) =>
        Members.map((member: { [x: string]: any }) => member['@odata.id'])
      )
      .catch((error) => console.log(error));
  },
  async getAllPowerSupplies({
    dispatch,
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
  async getChassisPower(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    id: any
  ) {
    return await api
      .get(`${id}/Power`)
      .then(({ data: { PowerSupplies } }) => PowerSupplies || [])
      .catch((error) => console.log(error));
  },
};
const PowerSupplyStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default PowerSupplyStore;
