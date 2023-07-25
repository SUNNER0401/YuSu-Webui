import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  systems: [] as any[],
};
type State = typeof state;

const getters = {
  systems: (state: State) => state.systems,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setSystemInfo: (
    state: State,
    data: {
      AssetTag: any;
      Description: any;
      BiosVersion: any;
      Name: any;
      Status: { Health: any; HealthRollup: any; State: any };
      Id: any;
      LocationIndicatorActive: any;
      Location: { PartLocation: { ServiceLabel: any } };
      Manufacturer: any;
      MemorySummary: {
        Status: { Health: any; HealthRollup: any; State: any };
      };
      Model: any;
      ProcessorSummary: {
        Count: any;
        Status: { Health: any; HealthRollup: any; State: any };
      };
      PowerState: any;
      SerialNumber: any;
      SubModel: any;
      SystemType: any;
    }
  ) => {
    const system: { [index: string]: any } = {};
    system.assetTag = data.AssetTag;
    system.description = data.Description;
    system.firmwareVersion = data.BiosVersion;
    system.hardwareType = data.Name;
    system.health = data.Status?.Health;
    system.id = data.Id;
    system.locationIndicatorActive = data.LocationIndicatorActive;
    system.locationNumber = data.Location?.PartLocation?.ServiceLabel;
    system.manufacturer = data.Manufacturer;
    system.memorySummaryHealth = data.MemorySummary?.Status.Health;
    system.memorySummaryHealthRollup = data.MemorySummary?.Status?.HealthRollup;
    system.memorySummaryState = data.MemorySummary?.Status?.State;
    system.model = data.Model;
    system.processorSummaryCount = data.ProcessorSummary?.Count;
    system.processorSummaryHealth = data.ProcessorSummary?.Status?.Health;
    system.processorSummaryHealthRoll =
      data.ProcessorSummary?.Status.HealthRollup;
    system.processorSummaryState = data.ProcessorSummary?.Status?.State;
    system.powerState = data.PowerState;
    system.serialNumber = data.SerialNumber;
    system.healthRollup = data.Status?.HealthRollup;
    system.subModel = data.SubModel;
    system.statusState = data.Status?.State;
    system.systemType = data.SystemType;
    state.systems = [system];
  },
};

type Multations = keyof typeof mutations;

const actionsNames = ['getSystem', 'changeIdentifyLedState'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getSystem({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1')
      .then((response) =>
        api.get(`${response.data.Systems['@odata.id']}/system`)
      )
      .then(({ data }) => commit('setSystemInfo', data))
      .catch((error) => console.log(error));
  },
  async changeIdentifyLedState(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    ledState: any
  ) {
    return await api
      .patch('/redfish/v1/Systems/system', {
        LocationIndicatorActive: ledState,
      })
      .catch((error) => {
        commit('setSystemInfo', this.state.system.systems[0]);
        console.log('error', error);
        if (ledState) {
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

const SystemStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default SystemStore;
