import api from '@/store/api';
import i18n from '@/i18n';

const PoliciesStore = {
  namespaced: true,
  state: {
    sshProtocolEnabled: false,
    ipmiProtocolEnabled: false,
  },
  getters: {
    sshProtocolEnabled: (state: { sshProtocolEnabled: any }) =>
      state.sshProtocolEnabled,
    ipmiProtocolEnabled: (state: { ipmiProtocolEnabled: any }) =>
      state.ipmiProtocolEnabled,
  },
  mutations: {
    setSshProtocolEnabled: (
      state: { sshProtocolEnabled: any },
      sshProtocolEnabled: any
    ) => (state.sshProtocolEnabled = sshProtocolEnabled),
    setIpmiProtocolEnabled: (
      state: { ipmiProtocolEnabled: any },
      ipmiProtocolEnabled: any
    ) => (state.ipmiProtocolEnabled = ipmiProtocolEnabled),
  },
  actions: {
    async getNetworkProtocolStatus({ commit }: any) {
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
    async saveIpmiProtocolState({ commit }: any, protocolEnabled: any) {
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
    async saveSshProtocolState({ commit }: any, protocolEnabled: any) {
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
  },
};

export default PoliciesStore;
