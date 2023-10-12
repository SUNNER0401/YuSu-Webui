import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '@/types/store';

const state = {
  bmc: {},
};
type State = typeof state;

const getters = {
  bmc: (state: State) => state.bmc,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setBmcInfo: (
    state: State,
    data: {
      [x: string]: any;
      DateTime: string | number | Date;
      Description: any;
      FirmwareVersion: any;
      GraphicalConsole: {
        ConnectTypesSupported: any;
        ServiceEnabled: any;
        MaxConcurrentSessions: any;
      };
      Status: { Health: any; HealthRollup: any; State: any };
      Id: any;
      LastResetTime: string | number | Date;
      LocationIndicatorActive: any;
      Location: { PartLocation: { ServiceLabel: any } };
      Manufacturer: any;
      ManagerType: any;
      Model: any;
      Name: any;
      PartNumber: any;
      PowerState: any;
      SerialConsole: {
        ConnectTypesSupported: any;
        ServiceEnabled: any;
        MaxConcurrentSessions: any;
      };
      SerialNumber: any;
      ServiceEntryPointUUID: any;
      SparePartNumber: any;
      UUID: any;
    }
  ) => {
    const bmc: { [index: string]: unknown } = {};
    bmc.dateTime = new Date(data.DateTime);
    bmc.description = data.Description;
    bmc.firmwareVersion = data.FirmwareVersion;
    bmc.graphicalConsoleConnectTypes =
      data.GraphicalConsole.ConnectTypesSupported;
    bmc.graphicalConsoleEnabled = data.GraphicalConsole.ServiceEnabled;
    bmc.graphicalConsoleMaxSessions =
      data.GraphicalConsole.MaxConcurrentSessions;
    bmc.health = data.Status.Health;
    bmc.healthRollup = data.Status.HealthRollup;
    bmc.id = data.Id;
    bmc.lastResetTime = new Date(data.LastResetTime);
    bmc.identifyLed = data.LocationIndicatorActive;
    bmc.locationNumber = data.Location?.PartLocation?.ServiceLabel;
    bmc.manufacturer = data.Manufacturer;
    bmc.managerType = data.ManagerType;
    bmc.model = data.Model;
    bmc.name = data.Name;
    bmc.partNumber = data.PartNumber;
    bmc.powerState = data.PowerState;
    bmc.serialConsoleConnectTypes = data.SerialConsole.ConnectTypesSupported;
    bmc.serialConsoleEnabled = data.SerialConsole.ServiceEnabled;
    bmc.serialConsoleMaxSessions = data.SerialConsole.MaxConcurrentSessions;
    bmc.serialNumber = data.SerialNumber;
    bmc.serviceEntryPointUuid = data.ServiceEntryPointUUID;
    bmc.sparePartNumber = data.SparePartNumber;
    bmc.statusState = data.Status.State;
    bmc.uuid = data.UUID;
    bmc.uri = data['@odata.id'];
    state.bmc = bmc;
  },
};

type Multations = keyof typeof mutations;

const actionsNames = ['getBmcInfo', 'updateIdentifyLedValue'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getBmcInfo({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Managers/bmc')
      .then(({ data }) => commit('setBmcInfo', data))
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
    return await api
      .patch(uri, updatedIdentifyLedValue)
      .then(() => dispatch('getBmcInfo'))
      .catch((error) => {
        dispatch('getBmcInfo');
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

const BmcStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default BmcStore;
