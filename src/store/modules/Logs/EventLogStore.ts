import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

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

const EventLogStore = {
  namespaced: true,
  state: {
    allEvents: [],
    loadedEvents: false,
  },
  getters: {
    allEvents: (state: { allEvents: any }) => state.allEvents,
    highPriorityEvents: (state: { allEvents: any }) =>
      getHighPriorityEvents(state.allEvents),
    healthStatus: (state: { allEvents: any; loadedEvents: any }) =>
      getHealthStatus(state.allEvents, state.loadedEvents),
  },
  mutations: {
    setAllEvents: (
      state: { allEvents: any; loadedEvents: boolean },
      allEvents: any
    ) => ((state.allEvents = allEvents), (state.loadedEvents = true)),
  },
  actions: {
    async getEventLogData({ commit }: any) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/EventLog/Entries')
        .then(({ data: { Members = [] } = {} }) => {
          const eventLogs = Members.map(
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
          commit('setAllEvents', eventLogs);
        })
        .catch((error) => {
          console.log('Event Log Data:', error);
        });
    },
    async deleteAllEventLogs({ dispatch }: any, data: string | any[]) {
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
    async deleteEventLogs({ dispatch }: any, uris = []) {
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
    async resolveEventLogs({ dispatch }: any, logs: any[]) {
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
    async unresolveEventLogs({ dispatch }: any, logs: any[]) {
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
      { dispatch }: any,
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
  },
};

export default EventLogStore;