import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  sshProtocolEnabled: false,
  ipmiProtocolEnabled: false,
};
type State = typeof state;

const getters = {
  sshProtocolEnabled: (state: State) => state.sshProtocolEnabled,
  ipmiProtocolEnabled: (state: State) => state.ipmiProtocolEnabled,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setSshProtocolEnabled: (state: State, sshProtocolEnabled: any) =>
    (state.sshProtocolEnabled = sshProtocolEnabled),
  setIpmiProtocolEnabled: (state: State, ipmiProtocolEnabled: any) =>
    (state.ipmiProtocolEnabled = ipmiProtocolEnabled),
};
type Multations = keyof typeof mutations;

const actionsNames = [
  'getNetworkProtocolStatus',
  'saveIpmiProtocolState',
  'saveSshProtocolState',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getNetworkProtocolStatus({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Managers/bmc/NetworkProtocol')
      .then((response) => {
        const sshProtocol = response.data.SSH.ProtocolEnabled;
        const ipmiProtocol = response.data.IPMI.ProtocolEnabled;
        commit('setSshProtocolEnabled', sshProtocol);
        commit('setIpmiProtocolEnabled', ipmiProtocol);
      })
      .catch((error) => console.log(error));
  },
  async saveIpmiProtocolState(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    protocolEnabled: any
  ) {
    commit('setIpmiProtocolEnabled', protocolEnabled);
    const ipmi = {
      IPMI: {
        ProtocolEnabled: protocolEnabled,
      },
    };
    return await api
      .patch('/redfish/v1/Managers/bmc/NetworkProtocol', ipmi)
      .then(() => {
        if (protocolEnabled) {
          return i18n.t('pagePolicies.toast.successIpmiEnabled');
        } else {
          return i18n.t('pagePolicies.toast.successIpmiDisabled');
        }
      })
      .catch((error) => {
        console.log(error);
        commit('setIpmiProtocolEnabled', !protocolEnabled);
        if (protocolEnabled) {
          throw new Error(
            i18n.t('pagePolicies.toast.errorIpmiEnabled') as string
          );
        } else {
          throw new Error(
            i18n.t('pagePolicies.toast.errorIpmiDisabled') as string
          );
        }
      });
  },
  async saveSshProtocolState(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    protocolEnabled: any
  ) {
    commit('setSshProtocolEnabled', protocolEnabled);
    const ssh = {
      SSH: {
        ProtocolEnabled: protocolEnabled,
      },
    };
    return await api
      .patch('/redfish/v1/Managers/bmc/NetworkProtocol', ssh)
      .then(() => {
        if (protocolEnabled) {
          return i18n.t('pagePolicies.toast.successSshEnabled');
        } else {
          return i18n.t('pagePolicies.toast.successSshDisabled');
        }
      })
      .catch((error) => {
        console.log(error);
        commit('setSshProtocolEnabled', !protocolEnabled);
        if (protocolEnabled) {
          throw new Error(
            i18n.t('pagePolicies.toast.errorSshEnabled') as string
          );
        } else {
          throw new Error(
            i18n.t('pagePolicies.toast.errorSshDisabled') as string
          );
        }
      });
  },
};

const PoliciesStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default PoliciesStore;
