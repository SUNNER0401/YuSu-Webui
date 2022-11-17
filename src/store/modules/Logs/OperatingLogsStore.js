import api from '@/store/api';
import i18n from '@/i18n';

const EventLogStore = {
  namespaced: true,
  state: {
    allEvents: [],
    loadedEvents: false,
  },
  getters: {
    allEvents: (state) => state.allEvents,
  },
  mutations: {
    setAllEvents: (state, allEvents) => (
      (state.allEvents = allEvents), (state.loadedEvents = true)
    ),
  },
  actions: {
    async getEventLogData({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/LogServices/AuditLog/Entries')
        .then(({ data: { Members = [] } = {} }) => {
          const eventLogs = Members.map((log) => {
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
          });
          commit('setAllEvents', eventLogs);
        })
        .catch((error) => {
          console.log('Event Log Data:', error);
        });
    },
    async deleteAllEventLogs({ dispatch }, data) {
      return await api
        .post(
          '/redfish/v1/Managers/bmc/LogServices/AuditLog/Actions/LogService.ClearLog'
        )
        .then(() => dispatch('getEventLogData'))
        .then(() =>
          i18n.tc('pageOperatingLogs.toast.successDelete', data.length)
        )
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
  },
};

export default EventLogStore;
