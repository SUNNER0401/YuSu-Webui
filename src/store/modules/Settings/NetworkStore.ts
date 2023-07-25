import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  ethernetData: [] as any[],
  firstInterfaceId: '', //used for setting global DHCP settings
  globalNetworkSettings: [] as any[],
  selectedInterfaceId: '', // which tab is selected
  selectedInterfaceIndex: 0, // which tab is selected
  domainState: '',
  dnsState: '',
};
type State = typeof state;

const getters = {
  ethernetData: (state: State) => state.ethernetData,
  firstInterfaceId: (state: State) => state.firstInterfaceId,
  globalNetworkSettings: (state: State) => state.globalNetworkSettings,
  selectedInterfaceId: (state: State) => state.selectedInterfaceId,
  selectedInterfaceIndex: (state: State) => state.selectedInterfaceIndex,
  domainState: (state: State) => state.domainState,
  dnsState: (state: State) => state.dnsState,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setDomainNameState: (state: State, domainState: any) =>
    (state.domainState = domainState),
  setDnsState: (state: State, dnsState: any) => (state.dnsState = dnsState),
  setEthernetData: (state: State, ethernetData: any) =>
    (state.ethernetData = ethernetData),
  setFirstInterfaceId: (state: State, firstInterfaceId: any) =>
    (state.firstInterfaceId = firstInterfaceId),
  setGlobalNetworkSettings: (state: State, data: { data: any }[]) => {
    state.globalNetworkSettings = data.map(({ data }) => {
      const {
        DHCPv4,
        HostName,
        IPv4Addresses,
        IPv4StaticAddresses,
        LinkStatus,
        MACAddress,
      } = data;
      return {
        defaultGateway: IPv4StaticAddresses[0]?.Gateway, //First static gateway is the default gateway
        dhcpAddress: IPv4Addresses.filter(
          (ipv4: { AddressOrigin: string }) => ipv4.AddressOrigin === 'DHCP'
        ),
        hostname: HostName,
        macAddress: MACAddress,
        linkStatus: LinkStatus,
        staticAddress: IPv4StaticAddresses[0]?.Address, // Display first static address on overview page
        useDnsEnabled: DHCPv4.UseDNSServers,
        useDomainNameEnabled: DHCPv4.UseDomainName,
        useNtpEnabled: DHCPv4.UseNTPServers,
      };
    });
  },
  setNtpState: (state: { ntpState: any }, ntpState: any) =>
    (state.ntpState = ntpState),
  setSelectedInterfaceId: (
    state: { selectedInterfaceId: any },
    selectedInterfaceId: any
  ) => (state.selectedInterfaceId = selectedInterfaceId),
  setSelectedInterfaceIndex: (
    state: { selectedInterfaceIndex: any },
    selectedInterfaceIndex: any
  ) => (state.selectedInterfaceIndex = selectedInterfaceIndex),
};
type Multations = keyof typeof mutations;

const actionsNames = [
  'getEthernetData',
  'saveDomainNameState',
  'saveDnsState',
  'saveNtpState',
  'setSelectedTabIndex',
  'setSelectedTabId',
  'saveIpv4Address',
  'editIpv4Address',
  'awakeDHCP',
  'saveSettings',
  'saveDnsAddress',
  'editDnsAddress',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getEthernetData({
    commit,
    state,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Managers/bmc/EthernetInterfaces')
      .then((response) =>
        response.data.Members.map(
          (ethernetInterface: { [x: string]: any }) =>
            ethernetInterface['@odata.id']
        )
      )
      .then((ethernetInterfaceIds) =>
        api.all(
          ethernetInterfaceIds.map((ethernetInterface: string) =>
            api.get(ethernetInterface)
          )
        )
      )
      .then((ethernetInterfaces: any) => {
        const ethernetData = ethernetInterfaces.map(
          (ethernetInterface: { data: string }) => ethernetInterface.data
        );
        const firstInterfaceId = ethernetData[0].Id;

        commit('setEthernetData', ethernetData);
        commit('setFirstInterfaceId', firstInterfaceId);
        // In order to avoid reset selectedInterfaceIndex when this value != 0
        if (state.selectedInterfaceIndex == 0)
          commit('setSelectedInterfaceId', firstInterfaceId);
        commit('setGlobalNetworkSettings', ethernetInterfaces);
      })
      .catch((error) => {
        console.log('Network Data:', error);
      });
  },
  async saveDomainNameState(
    { commit, state }: ActionContext<ActionNames, Multations, State, Getters>,
    domainState: any
  ) {
    commit('setDomainNameState', domainState);
    const data = {
      DHCPv4: {
        UseDomainName: domainState,
      },
    };
    // Saving to the first interface automatically updates DHCPv4 and DHCPv6
    // on all interfaces
    return api
      .patch(
        `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.firstInterfaceId}`,
        data
      )
      .then(() => {
        return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
          setting: i18n.t('pageNetwork.domainName'),
        });
      })
      .catch((error) => {
        console.log(error);
        commit('setDomainNameState', !domainState);
        throw new Error(
          i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.domainName'),
          }) as string
        );
      });
  },
  async saveDnsState(
    { commit, state }: ActionContext<ActionNames, Multations, State, Getters>,
    dnsState: any
  ) {
    commit('setDnsState', dnsState);
    const data = {
      DHCPv4: {
        UseDNSServers: dnsState,
      },
    };
    // Saving to the first interface automatically updates DHCPv4 and DHCPv6
    // on all interfaces
    return api
      .patch(
        `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.firstInterfaceId}`,
        data
      )
      .then(() => {
        return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
          setting: i18n.t('pageNetwork.dns'),
        });
      })
      .catch((error) => {
        console.log(error);
        commit('setDnsState', !dnsState);
        throw new Error(
          i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          }) as string
        );
      });
  },
  async saveNtpState(
    { commit, state }: ActionContext<ActionNames, Multations, State, Getters>,
    ntpState: any
  ) {
    commit('setNtpState', ntpState);
    const data = {
      DHCPv4: {
        UseNTPServers: ntpState,
      },
    };
    // Saving to the first interface automatically updates DHCPv4 and DHCPv6
    // on all interfaces
    return api
      .patch(
        `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.firstInterfaceId}`,
        data
      )
      .then(() => {
        return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
          setting: i18n.t('pageNetwork.ntp'),
        });
      })
      .catch((error) => {
        console.log(error);
        commit('setNtpState', !ntpState);
        throw new Error(
          i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ntp'),
          }) as string
        );
      });
  },
  async setSelectedTabIndex(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    tabIndex: any
  ) {
    commit('setSelectedInterfaceIndex', tabIndex);
  },
  async setSelectedTabId(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    tabId: any
  ) {
    commit('setSelectedInterfaceId', tabId);
  },
  async saveIpv4Address(
    { dispatch, state }: ActionContext<ActionNames, Multations, State, Getters>,
    ipv4Form: any
  ) {
    const originalAddresses = state.ethernetData[
      state.selectedInterfaceIndex
    ].IPv4StaticAddresses.map(
      (ipv4: { Address: any; SubnetMask: any; Gateway: any }) => {
        const { Address, SubnetMask, Gateway } = ipv4;
        return {
          Address,
          SubnetMask,
          Gateway,
        };
      }
    );
    const newAddress = [ipv4Form];
    return api
      .patch(
        `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
        { IPv4StaticAddresses: originalAddresses.concat(newAddress) }
      )
      .then(dispatch('getEthernetData'))
      .then(() => {
        return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
          setting: i18n.t('pageNetwork.ipv4'),
        });
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          }) as string
        );
      });
  },
  async editIpv4Address(
    { dispatch, state }: ActionContext<ActionNames, Multations, State, Getters>,
    ipv4TableData: any
  ) {
    return api
      .patch(
        `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
        { IPv4StaticAddresses: ipv4TableData }
      )
      .then(dispatch('getEthernetData'))
      .then(() => {
        return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
          setting: i18n.t('pageNetwork.ipv4'),
        });
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          }) as string
        );
      });
  },
  async awakeDHCP({
    dispatch,
    state,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return api
      .patch(
        `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
        {
          DHCPv4: {
            DHCPEnabled: true,
          },
        }
      )
      .then(dispatch('getEthernetData'))
      .then(() => {
        return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
          setting: i18n.t('pageNetwork.ipv4'),
        });
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          }) as string
        );
      });
  },
  async saveSettings(
    { state, dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    interfaceSettingsForm: any
  ) {
    return api
      .patch(
        `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
        interfaceSettingsForm
      )
      .then(dispatch('getEthernetData'))
      .then(() => {
        return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
          setting: i18n.t('pageNetwork.network'),
        });
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.network'),
          }) as string
        );
      });
  },
  async saveDnsAddress(
    { dispatch, state }: ActionContext<ActionNames, Multations, State, Getters>,
    dnsForm: any
  ) {
    const newAddress = dnsForm;
    const originalAddresses =
      state.ethernetData[state.selectedInterfaceIndex].StaticNameServers;
    const newDnsArray = originalAddresses.concat(newAddress);
    return api
      .patch(
        `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
        { StaticNameServers: newDnsArray }
      )
      .then(dispatch('getEthernetData'))
      .then(() => {
        return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
          setting: i18n.t('pageNetwork.dns'),
        });
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          }) as string
        );
      });
  },
  async editDnsAddress(
    { dispatch, state }: ActionContext<ActionNames, Multations, State, Getters>,
    dnsTableData: any
  ) {
    return api
      .patch(
        `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
        { StaticNameServers: dnsTableData }
      )
      .then(dispatch('getEthernetData'))
      .then(() => {
        return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
          setting: i18n.t('pageNetwork.dns'),
        });
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          }) as string
        );
      });
  },
};

const NetworkStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default NetworkStore;
