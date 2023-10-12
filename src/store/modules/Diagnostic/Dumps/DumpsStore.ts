import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '@/types/store';

const state = {
  bmcDumps: [] as any[],
};
type State = typeof state;

const getters = {
  bmcDumps: (state: State) => state.bmcDumps,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setBmcDumps: (state: State, dumps: any[]) => {
    state.bmcDumps = dumps.map(
      (dump: {
        [x: string]: any;
        AdditionalDataURI: any;
        Created: string | number | Date;
        Name: any;
        Id: any;
        AdditionalDataSizeBytes: any;
      }) => ({
        data: dump.AdditionalDataURI,
        dateTime: new Date(dump.Created),
        dumpType: dump.Name,
        id: dump.Id,
        location: dump['@odata.id'],
        size: dump.AdditionalDataSizeBytes,
      })
    );
  },
};

type Multations = keyof typeof mutations;

const actionsNames = [
  'getBmcDumps',
  'createBmcDump',
  'createSystemDump',
  'deleteDumps',
  'deleteAllDumps',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getBmcDumps({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Managers/bmc/LogServices/Dump/Entries')
      .then(({ data = {} }) => commit('setBmcDumps', data.Members || []))
      .catch((error) => console.log(error));
  },
  async createBmcDump() {
    return await api
      .post(
        '/redfish/v1/Managers/bmc/LogServices/Dump/Actions/LogService.CollectDiagnosticData',
        {
          DiagnosticDataType: 'Manager',
          OEMDiagnosticDataType: '',
        },
        undefined
      )
      .catch((error) => {
        console.log(error);
        throw new Error(i18n.t('pageDumps.toast.errorStartBmcDump') as string);
      });
  },
  async createSystemDump() {
    return await api
      .post(
        '/redfish/v1/Systems/system/LogServices/Dump/Actions/LogService.CollectDiagnosticData',
        {
          DiagnosticDataType: 'OEM',
          OEMDiagnosticDataType: 'System',
        },
        undefined
      )
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageDumps.toast.errorStartSystemDump') as string
        );
      });
  },
  async deleteDumps(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    dumps: { location: any }[]
  ) {
    const promises = dumps.map(({ location }) =>
      api.delete(location, undefined).catch((error) => {
        console.log(error);
        return error;
      })
    );
    return await api
      .all(promises)
      .then((response) => {
        dispatch('getBmcDumps');
        return response;
      })
      .then(
        api.spread((...responses) => {
          const { successCount, errorCount } = getResponseCount(responses);
          const toastMessages = [];

          if (successCount) {
            const message = i18n.tc(
              'pageDumps.toast.successDeleteDump',
              successCount
            );
            toastMessages.push({ type: 'success', message });
          }

          if (errorCount) {
            const message = i18n.tc(
              'pageDumps.toast.errorDeleteDump',
              errorCount
            );
            toastMessages.push({ type: 'error', message });
          }

          return toastMessages;
        })
      );
  },
  async deleteAllDumps({
    commit,
    state,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    const totalDumpCount = state.bmcDumps.length;
    return await api
      .post(
        '/redfish/v1/Managers/bmc/LogServices/Dump/Actions/LogService.ClearLog',
        {},
        undefined
      )
      .then(() => {
        commit('setBmcDumps', []);
        return i18n.tc('pageDumps.toast.successDeleteDump', totalDumpCount);
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.tc('pageDumps.toast.errorDeleteDump', totalDumpCount)
        );
      });
  },
};

const DumpsStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default DumpsStore;
