import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  allEvents: [],
  loadedEvents: false,
};
type State = typeof state;

const getters = {
  allEvents: (state: State) => state.allEvents,
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
  'cutEventLog',
  'deleteAllEventLogs',
  'download',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getEventLogData({
    dispatch,
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    const eventLogs = await dispatch(
      'cutEventLog',
      '/redfish/v1/Managers/bmc/LogServices/AuditLog/Entries'
    );
    commit('setAllEvents', eventLogs);
  },
  async cutEventLog(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    url: string
  ) {
    return await api
      .get(url)
      .then(async ({ data }) => {
        let eventLogs = data.Members.map(
          (log: {
            [x: string]: any;
            Created?: any;
            Id?: any;
            Message?: any;
            Oem?: any;
          }) => {
            const { Created, Id, Message, Oem } = log;
            return {
              id: Id,
              date: new Date(Created),
              message: Message,
              uri: log['@odata.id'],
              interface: Oem[0],
              ip: Oem[1],
              username: Oem[2],
            };
          }
        );
        if (data['Members@odata.nextLink']) {
          eventLogs = [
            ...eventLogs,
            ...(await dispatch('cutEventLog', data['Members@odata.nextLink'])),
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
        '/redfish/v1/Managers/bmc/LogServices/AuditLog/Actions/LogService.ClearLog',
        {},
        undefined
      )
      .then(() => dispatch('getEventLogData'))
      .then(() => i18n.tc('pageOperatingLogs.toast.successDelete', data.length))
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.tc('pageOperatingLogs.toast.errorDelete', data.length)
        );
      });
  },
  async download() {
    return await api
      .get('/download/audit')
      .then(() => {
        return 'Success';
      })
      .catch(() => {
        throw new Error('Failed');
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
