import api from '@/store/api';
import i18n from '@/i18n';

const PostCodeLogsStore = {
  namespaced: true,
  state: {
    allPostCodes: [],
  },
  getters: {
    allPostCodes: (state: { allPostCodes: any }) => state.allPostCodes,
  },
  mutations: {
    setAllPostCodes: (state: { allPostCodes: any }, allPostCodes: any) =>
      (state.allPostCodes = allPostCodes),
  },
  actions: {
    async getPostCodesLogData({ commit }: any) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/PostCodes/Entries')
        .then(({ data: { Members = [] } = {} }) => {
          const postCodeLogs = Members.map(
            (log: {
              Id: string;
              Severity: string;
              Message: string;
              Created: string;
              Oem: { [index: string]: any };
            }) => {
              const { Id, Severity, Message, Created, Oem } = log;
              return {
                Id: Id,
                Severity: Severity,
                Message: Message,
                Created: Created,
                TimeStampOffset: Oem.TimeStampOffset,
                Postcode: Oem.Postcode,
              };
            }
          );
          commit('setAllPostCodes', postCodeLogs);
        })
        .catch((error) => {
          console.log('POST Codes Log Data:', error);
        });
    },
    deleteAll({ dispatch }: any, allLogs: { [index: string]: any }) {
      api
        .post(
          '/redfish/v1/Systems/system/LogServices/PostCodes/Actions/LogService.ClearLog',
          undefined,
          undefined
        )
        .then(() => {
          dispatch('getPostCodesLogData');
        })
        .then(() => {
          i18n.tc('pagePostCodeLogs.toast.successDelete', allLogs.length);
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.tc('pagePostCodeLogs.toast.errorDelete', allLogs.length)
          );
        });
    },
  },
};

export default PostCodeLogsStore;
