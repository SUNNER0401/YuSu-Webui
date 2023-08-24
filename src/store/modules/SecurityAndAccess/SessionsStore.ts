import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

type SessionSettingsForm = {
  SessionTimeout: number;
};

const state = {
  allConnections: [],
  sessionTimeout: 0,
};
type State = typeof state;

const getters = {
  allConnections: (state: State) => state.allConnections,
  sessionTimeout: (state: State) => state.sessionTimeout,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setAllConnections: (state: State, allConnections: any) =>
    (state.allConnections = allConnections),
  setSessionTimeout: (state: State, sessionTimeout: number) =>
    (state.sessionTimeout = sessionTimeout),
};
type Multations = keyof typeof mutations;

const actionsNames = [
  'getSessionsData',
  'disconnectSessions',
  'getSessionTimeout',
  'setSessionTimeout',
  'commitSessionSettings',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getSessionsData({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
  async disconnectSessions(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    uris: string[] = []
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
  async getSessionTimeout({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return api
      .get('/redfish/v1/SessionService/')
      .then(({ data: { SessionTimeout } }) => {
        commit('setSessionTimeout', SessionTimeout);
      });
  },
  async setSessionTimeout(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    payload: { SessionTimeout: number }
  ) {
    return api
      .patch('/redfish/v1/SessionService/', payload)
      .then(async () => {
        await dispatch('getSessionTimeout');
      })
      .catch((err) => {
        throw err;
      });
  },
  async commitSessionSettings(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    payload: SessionSettingsForm
  ) {
    let promises: Promise<any>[] = [];
    let p = dispatch('setSessionTimeout', {
      SessionTimeout: payload.SessionTimeout,
    });
    promises.push(p);
    await Promise.all(promises).catch((err) => {
      throw err;
    });
  },
};

const SessionsStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
export default SessionsStore;
