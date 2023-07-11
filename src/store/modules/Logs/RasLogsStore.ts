import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

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

const RasLogsStore = {
  namespaced: true,
  state: {
    allRasLogs: [],
    loadedEvents: false,
  },
  getters: {
    allRasLogs: (state: { allRasLogs: any }) => state.allRasLogs,
    highPriorityEvents: (state: { allRasLogs: any }) =>
      getHighPriorityEvents(state.allRasLogs),
    healthStatus: (state: { allRasLogs: any; loadedEvents: any }) =>
      getHealthStatus(state.allRasLogs, state.loadedEvents),
  },
  mutations: {
    setAllRasLogs: (
      state: { allRasLogs: any; loadedEvents: boolean },
      allRasLogs: any
    ) => ((state.allRasLogs = allRasLogs), (state.loadedEvents = true)),
  },
  actions: {
    async getRasResource() {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/RasEvent')
        .catch((err) => {
          throw err;
        });
    },
    async getRasLogData({ commit }: any) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/RasEvent/Entries')
        .then(({ data: { Members = [] } = {} }) => {
          const rasLogs = Members.map((log: { [x: string]: any }) => {
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
            console.log(MessageArgs);
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
          commit('setAllRasLogs', rasLogs);
        })
        .catch((error) => {
          console.log('Event Log Data:', error);
        });
    },
    async deleteAllRasLogs({ dispatch }: any, data: string | any[]) {
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
    async deleteRasLogs({ dispatch }: any, uris = []) {
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
    async downloadRasLogs(_: any, uris = []) {
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
    async viewRasLog(_: any, url: string) {
      let link = document.createElement('a');
      link.target = '_blank';
      link.href = url.split('/attachment')[0] + '/json';
      link.click();
    },
  },
};

export default RasLogsStore;