import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '@/types/store';

const getHealthStatus = (events: any, loadedEvents: any) => {
  let status = loadedEvents ? 'OK' : '';
  for (const event of events) {
    if (event.severity === 'Warning') {
      status = 'Warning';
    }
    if (event.severity === 'Critical') {
      status = 'Critical';
      break;
    }
  }
  return status;
};

// TODO: High priority events should also check if Log
// is resolved when the property is available in Redfish
const getHighPriorityEvents = (events: any[]) =>
  events.filter(({ severity }) => severity === 'Critical');

const state = {
  allEvents: [],
  loadedEvents: false,
};
type State = typeof state;

const getters = {
  allEvents: (state: State) => state.allEvents,
  highPriorityEvents: (state: State) => getHighPriorityEvents(state.allEvents),
  healthStatus: (state: State) =>
    getHealthStatus(state.allEvents, state.loadedEvents),
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setAllEvents: (state: State, allEvents: any) => (
    (state.allEvents = allEvents), (state.loadedEvents = true)
  ),
};

type Multations = keyof typeof mutations;

const actionsNames = [
  'getEventLogData',
  'cutEventLogs',
  'deleteAllEventLogs',
  'deleteEventLogs',
  'resolveEventLogs',
  'unresolveEventLogs',
  'updateEventLogStatus',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getEventLogData({
    dispatch,
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    const eventLogs = await dispatch(
      'cutEventLogs',
      '/redfish/v1/Systems/system/LogServices/EventLog/Entries'
    );
    commit('setAllEvents', eventLogs);
  },
  async cutEventLogs(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    url: string
  ) {
    return await api
      .get(url)
      .then(async ({ data }) => {
        let eventLogs = data.Members.map(
          (log: {
            [x: string]: any;
            Id?: any;
            Severity?: any;
            Created?: any;
            EntryType?: any;
            Message?: any;
            Name?: any;
            Modified?: any;
            Resolved?: any;
            AdditionalDataURI?: any;
          }) => {
            const {
              Id,
              Severity,
              Created,
              EntryType,
              Message,
              Name,
              Modified,
              Resolved,
              AdditionalDataURI,
            } = log;
            return {
              id: Id,
              severity: Severity,
              date: new Date(Created),
              type: EntryType,
              description: Message,
              name: Name,
              modifiedDate: new Date(Modified),
              uri: log['@odata.id'],
              filterByStatus: Resolved ? 'Resolved' : 'Unresolved',
              status: Resolved, //true or false
              additionalDataUri: AdditionalDataURI,
            };
          }
        );
        if (data['Members@odata.nextLink']) {
          eventLogs = [
            ...eventLogs,
            ...(await dispatch('cutEventLogs', data['Members@odata.nextLink'])),
          ];
        }
        return eventLogs;
      })
      .catch((error) => {
        console.log('Event Log Data:', error);
      });
  },
  async deleteAllEventLogs(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    data: string | any[]
  ) {
    return await api
      .post(
        '/redfish/v1/Systems/system/LogServices/EventLog/Actions/LogService.ClearLog',
        '',
        undefined
      )
      .then(() => dispatch('getEventLogData'))
      .then(() => i18n.tc('pageEventLogs.toast.successDelete', data.length))
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.tc('pageEventLogs.toast.errorDelete', data.length)
        );
      });
  },
  async deleteEventLogs(
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
        dispatch('getEventLogData');
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
  async resolveEventLogs(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    logs: any[]
  ) {
    const promises = logs.map((log: { uri: string }) =>
      api.patch(log.uri, { Resolved: true }).catch((error) => {
        console.log(error);
        return error;
      })
    );
    return await api
      .all(promises)
      .then((response) => {
        dispatch('getEventLogData');
        return response;
      })
      .then(
        api.spread((...responses) => {
          const { successCount, errorCount } = getResponseCount(responses);
          const toastMessages = [];
          if (successCount) {
            const message = i18n.tc(
              'pageEventLogs.toast.successResolveLogs',
              successCount
            );
            toastMessages.push({ type: 'success', message });
          }
          if (errorCount) {
            const message = i18n.tc(
              'pageEventLogs.toast.errorResolveLogs',
              errorCount
            );
            toastMessages.push({ type: 'error', message });
          }
          return toastMessages;
        })
      );
  },
  async unresolveEventLogs(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    logs: any[]
  ) {
    const promises = logs.map((log: { uri: string }) =>
      api.patch(log.uri, { Resolved: false }).catch((error) => {
        console.log(error);
        return error;
      })
    );
    return await api
      .all(promises)
      .then((response) => {
        dispatch('getEventLogData');
        return response;
      })
      .then(
        api.spread((...responses) => {
          const { successCount, errorCount } = getResponseCount(responses);
          const toastMessages = [];
          if (successCount) {
            const message = i18n.tc(
              'pageEventLogs.toast.successUnresolveLogs',
              successCount
            );
            toastMessages.push({ type: 'success', message });
          }
          if (errorCount) {
            const message = i18n.tc(
              'pageEventLogs.toast.errorUnresolveLogs',
              errorCount
            );
            toastMessages.push({ type: 'error', message });
          }
          return toastMessages;
        })
      );
  },
  // Single log entry
  async updateEventLogStatus(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    log: { status: any; uri: string }
  ) {
    const updatedEventLogStatus = log.status;
    return await api
      .patch(log.uri, { Resolved: updatedEventLogStatus })
      .then(() => {
        dispatch('getEventLogData');
      })
      .then(() => {
        if (log.status) {
          return i18n.tc('pageEventLogs.toast.successResolveLogs', 1);
        } else {
          return i18n.tc('pageEventLogs.toast.successUnresolveLogs', 1);
        }
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageEventLogs.toast.errorLogStatusUpdate') as string
        );
      });
  },
};

const EventLogStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default EventLogStore;
