import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  allPostCodes: [],
};
type State = typeof state;

const getters = {
  allPostCodes: (state: State) => state.allPostCodes,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setAllPostCodes: (state: State, allPostCodes: any) =>
    (state.allPostCodes = allPostCodes),
};

type Multations = keyof typeof mutations;

const actionsNames = ['getPostCodesLogData', 'deleteAll'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getPostCodesLogData({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
              CodeType: Oem.Codetype,
            };
          }
        );
        commit('setAllPostCodes', postCodeLogs);
      })
      .catch((error) => {
        console.log('POST Codes Log Data:', error);
      });
  },
  deleteAll(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    allLogs: { [index: string]: any }
  ) {
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
};

const PostCodeLogsStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default PostCodeLogsStore;
