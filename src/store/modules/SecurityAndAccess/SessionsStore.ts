import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const SessionsStore = {
  namespaced: true,
  state: {
    allConnections: [],
  },
  getters: {
    allConnections: (state: { allConnections: any }) => state.allConnections,
  },
  mutations: {
    setAllConnections: (state: { allConnections: any }, allConnections: any) =>
      (state.allConnections = allConnections),
  },
  actions: {
    async getSessionsData({ commit }: any) {
      return await api
        .get('/redfish/v1/SessionService/Sessions')
        .then((response) =>
          response.data.Members.map(
            (sessionLogs: { [x: string]: any }) => sessionLogs['@odata.id']
          )
        )
        .then((sessionUris) =>
          api.all(sessionUris.map((sessionUri: string) => api.get(sessionUri)))
        )
        .then((sessionUris: { [index: string]: any }) => {
          const allConnectionsData = sessionUris.map(
            (sessionUri: { data?: any }) => {
              return {
                clientID: sessionUri.data?.Oem?.OpenBMC.ClientID,
                username: sessionUri.data?.UserName,
                ipAddress: sessionUri.data?.ClientOriginIPAddress,
                uri: sessionUri.data['@odata.id'],
              };
            }
          );
          commit('setAllConnections', allConnectionsData);
        })
        .catch((error) => {
          console.log('Client Session Data:', error);
        });
    },
    async disconnectSessions({ dispatch }: any, uris = []) {
      const promises = uris.map((uri) =>
        api.delete(uri, undefined).catch((error) => {
          console.log(error);
          return error;
        })
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getSessionsData');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'pageSessions.toast.successDelete',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'pageSessions.toast.errorDelete',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }
            return toastMessages;
          })
        );
    },
  },
};
export default SessionsStore;
