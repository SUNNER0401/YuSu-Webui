import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const getHealthStatus = (logs: any, loadedEvents: any) => {
  let status = loadedEvents ? 'OK' : '';
  for (const log of logs) {
    if (log.severity === 'Warning') {
      status = 'Warning';
    }
    if (log.severity === 'Critical') {
      status = 'Critical';
      break;
    }
  }
  return status;
};

// TODO: High priority logs should also check if Log
// is resolved when the property is available in Redfish
const getHighPriorityEvents = (logs: any[]) =>
  logs.filter(({ severity }) => severity === 'Critical');

const state = {
  allRasLogs: [],
  loadedEvents: false,
};
type State = typeof state;

const getters = {
  allRasLogs: (state: State) => state.allRasLogs,
  highPriorityEvents: (state: State) => getHighPriorityEvents(state.allRasLogs),
  healthStatus: (state: State) =>
    getHealthStatus(state.allRasLogs, state.loadedEvents),
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setAllRasLogs: (state: State, allRasLogs: any) => (
    (state.allRasLogs = allRasLogs), (state.loadedEvents = true)
  ),
};

type Multations = keyof typeof mutations;

const actionsNames = [
  'getRasResource',
  'getRasLogData',
  'cutRasLogs',
  'deleteAllRasLogs',
  'deleteRasLogs',
  'downloadRasLogs',
  'viewRasLog',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getRasResource() {
    return await api
      .get('/redfish/v1/Systems/system/LogServices/RasEvent')
      .catch((err) => {
        throw err;
      });
  },
  async getRasLogData({
    dispatch,
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    const postCodeLogs = await dispatch(
      'cutRasLogs',
      '/redfish/v1/Managers/bmc/LogServices/RasEvent/Entries'
    );
    commit('setAllRasLogs', postCodeLogs);
  },
  async cutRasLogs(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    url: string
  ) {
    return await api
      .get(url)
      .then(async ({ data }) => {
        let rasLogs = data.Members.map((log: { [x: string]: any }) => {
          let {
            Id,
            Severity,
            Created,
            EntryType,
            Message,
            Name,
            AdditionalDataURI,
            MessageArgs,
          } = log;
          return {
            id: Id,
            severity: Severity,
            date: new Date(Created),
            type: EntryType,
            description: Message,
            name: Name,
            uri: log['@odata.id'],
            additionalDataUri: AdditionalDataURI,
            messageArgs: MessageArgs,
          };
        });
        if (data['Members@odata.nextLink']) {
          rasLogs = [
            ...rasLogs,
            ...(await dispatch('cutRasLogs', data['Members@odata.nextLink'])),
          ];
        }
        return rasLogs;
      })
      .catch((error) => {
        console.log('Event Log Data:', error);
      });
  },
  async deleteAllRasLogs(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    data: string | any[]
  ) {
    return await api
      .post(
        '/redfish/v1/Systems/system/LogServices/RasEvent/Actions/LogService.ClearLog',
        '',
        undefined
      )
      .then(() => dispatch('getRasLogData'))
      .then(() => i18n.tc('pageEventLogs.toast.successDelete', data.length))
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.tc('pageEventLogs.toast.errorDelete', data.length)
        );
      });
  },
  async deleteRasLogs(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    uris = []
  ) {
    const promises = uris.map((uri) =>
      api.delete(uri, undefined).catch((error) => {
        console.log(error);
        return error;
      })
    );
    return await api
      .all(promises)
      .then((response) => {
        dispatch('getRasLogData');
        return response;
      })
      .then(
        api.spread((...responses) => {
          const { successCount, errorCount } = getResponseCount(responses);
          const toastMessages = [];

          if (successCount) {
            const message = i18n.tc(
              'pageEventLogs.toast.successDelete',
              successCount
            );
            toastMessages.push({ type: 'success', message });
          }

          if (errorCount) {
            const message = i18n.tc(
              'pageEventLogs.toast.errorDelete',
              errorCount
            );
            toastMessages.push({ type: 'error', message });
          }

          return toastMessages;
        })
      );
  },
  async downloadRasLogs(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    uris = []
  ) {
    const promises = uris.map((uri) =>
      api
        .get(uri, {
          responseType: 'blob',
        })
        .then((res) => {
          let filename = res.headers['content-disposition']
            .split('filename=')[1]
            .replace(/"/g, '');
          let URL = window.URL.createObjectURL(res.data);

          let link = document.createElement('a');
          link.href = URL;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(URL);
          return 'success';
        })
        .catch((error) => {
          console.log(error);
          return 'failed';
        })
    );
    return await api.all(promises).then((res) => {
      let count = 0;
      res.forEach((res) => {
        if (res === 'failed') {
          count++;
        }
      });
      if (count) {
        alert(i18n.tc('pageEventLogs.modal.download', count));
      }
    });
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async viewRasLog(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    url: string
  ) {
    let link = document.createElement('a');
    link.target = '_blank';
    link.href = url.split('/attachment')[0] + '/json';
    link.click();
  },
};

const RasLogsStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default RasLogsStore;
