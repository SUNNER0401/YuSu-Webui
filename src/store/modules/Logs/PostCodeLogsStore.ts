import api from '@/store/api';

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
              Created: any;
              MessageArgs: any;
              AdditionalDataURI: any;
            }) => {
              const { Created, MessageArgs, AdditionalDataURI } = log;
              return {
                date: new Date(Created),
                bootCount: MessageArgs[0],
                timeStampOffset: MessageArgs[1],
                postCode: MessageArgs[2],
                uri: AdditionalDataURI,
              };
            }
          );
          commit('setAllPostCodes', postCodeLogs);
        })
        .catch((error) => {
          console.log('POST Codes Log Data:', error);
        });
    },
  },
};

export default PostCodeLogsStore;
