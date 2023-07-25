import api from '@/store/api';
import i18n from '@/i18n';

import { find } from 'lodash';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  isServiceEnabled: null,
  ldap: {
    serviceEnabled: null,
    serviceAddress: null,
    bindDn: null,
    baseDn: null,
    userAttribute: null,
    groupsAttribute: null,
    roleGroups: [],
  },
  activeDirectory: {
    serviceEnabled: null,
    serviceAddress: null,
    bindDn: null,
    baseDn: null,
    userAttribute: null,
    groupsAttribute: null,
    roleGroups: [],
  },
};
type State = typeof state;

const getters = {
  isServiceEnabled: (state: State) => state.isServiceEnabled,
  ldap: (state: State) => state.ldap,
  activeDirectory: (state: State) => state.activeDirectory,
  isActiveDirectoryEnabled: (state: {
    activeDirectory: { serviceEnabled: any };
  }) => {
    return state.activeDirectory.serviceEnabled;
  },
  enabledRoleGroups: (
    state: State,
    getters: { isActiveDirectoryEnabled: any }
  ) => {
    const serviceType = getters.isActiveDirectoryEnabled
      ? 'activeDirectory'
      : 'ldap';
    return state[serviceType].roleGroups;
  },
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setServiceEnabled: (state: State, serviceEnabled: any) =>
    (state.isServiceEnabled = serviceEnabled),
  setLdapProperties: (
    state: {
      ldap: {
        serviceAddress: any;
        serviceEnabled: any;
        baseDn: any;
        bindDn: any;
        userAttribute: any;
        groupsAttribute: any;
        roleGroups: never[];
      };
    },
    {
      ServiceEnabled,
      ServiceAddresses = [],
      Authentication = {},
      LDAPService: {
        SearchSettings: {
          BaseDistinguishedNames = [],
          UsernameAttribute = '',
          GroupsAttribute = '',
        } = {},
      } = {},
      RemoteRoleMapping = [],
    }: any
  ) => {
    state.ldap.serviceAddress = ServiceAddresses[0];
    state.ldap.serviceEnabled = ServiceEnabled;
    state.ldap.baseDn = BaseDistinguishedNames[0];
    state.ldap.bindDn = Authentication.Username;
    state.ldap.userAttribute = UsernameAttribute;
    state.ldap.groupsAttribute = GroupsAttribute;
    state.ldap.roleGroups = RemoteRoleMapping;
  },
  setActiveDirectoryProperties: (
    state: {
      activeDirectory: {
        serviceEnabled: any;
        serviceAddress: any;
        bindDn: any;
        baseDn: any;
        userAttribute: any;
        groupsAttribute: any;
        roleGroups: never[];
      };
    },
    {
      ServiceEnabled,
      ServiceAddresses = [],
      Authentication = {},
      LDAPService: {
        SearchSettings: {
          BaseDistinguishedNames = [],
          UsernameAttribute = '',
          GroupsAttribute = '',
        } = {},
      } = {},
      RemoteRoleMapping = [],
    }: any
  ) => {
    state.activeDirectory.serviceEnabled = ServiceEnabled;
    state.activeDirectory.serviceAddress = ServiceAddresses[0];
    state.activeDirectory.bindDn = Authentication.Username;
    state.activeDirectory.baseDn = BaseDistinguishedNames[0];
    state.activeDirectory.userAttribute = UsernameAttribute;
    state.activeDirectory.groupsAttribute = GroupsAttribute;
    state.activeDirectory.roleGroups = RemoteRoleMapping;
  },
};
type Multations = keyof typeof mutations;

const actionsNames = [
  'getAccountSettings',
  'saveLdapSettings',
  'saveActiveDirectorySettings',
  'saveAccountSettings',
  'addNewRoleGroup',
  'saveRoleGroup',
  'deleteRoleGroup',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getAccountSettings({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/AccountService')
      .then(({ data: { LDAP = {}, ActiveDirectory = {} } }) => {
        const ldapEnabled = LDAP.ServiceEnabled;
        const activeDirectoryEnabled = ActiveDirectory.ServiceEnabled;

        commit('setServiceEnabled', ldapEnabled || activeDirectoryEnabled);
        commit('setLdapProperties', LDAP);
        commit('setActiveDirectoryProperties', ActiveDirectory);
      })
      .catch((error) => console.log(error));
  },
  async saveLdapSettings(
    { state, dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    properties: any
  ) {
    const data = { LDAP: properties };
    if (state.activeDirectory.serviceEnabled) {
      // Disable Active Directory service if enabled
      await api.patch('/redfish/v1/AccountService', {
        ActiveDirectory: { ServiceEnabled: false },
      });
    }
    return await api
      .patch('/redfish/v1/AccountService', data)
      .then(() => dispatch('getAccountSettings'))
      .then(() => i18n.t('pageLdap.toast.successSaveLdapSettings'))
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageLdap.toast.errorSaveLdapSettings') as string
        );
      });
  },
  async saveActiveDirectorySettings(
    { state, dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    properties: any
  ) {
    const data = { ActiveDirectory: properties };
    if (state.ldap.serviceEnabled) {
      // Disable LDAP service if enabled
      await api.patch('/redfish/v1/AccountService', {
        LDAP: { ServiceEnabled: false },
      });
    }
    return await api
      .patch('/redfish/v1/AccountService', data)
      .then(() => dispatch('getAccountSettings'))
      .then(() => i18n.t('pageLdap.toast.successSaveActiveDirectorySettings'))
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageLdap.toast.errorSaveActiveDirectorySettings') as string
        );
      });
  },
  async saveAccountSettings(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    {
      serviceEnabled,
      serviceAddress,
      activeDirectoryEnabled,
      bindDn,
      bindPassword,
      baseDn,
      userIdAttribute,
      groupIdAttribute,
    }: any
  ) {
    const data: any = {
      ServiceEnabled: serviceEnabled,
      ServiceAddresses: [serviceAddress],
      Authentication: {
        Username: bindDn,
        Password: bindPassword,
      },
      LDAPService: {
        SearchSettings: {
          BaseDistinguishedNames: [baseDn],
        },
      },
    };
    if (groupIdAttribute)
      data.LDAPService.SearchSettings.GroupsAttribute = groupIdAttribute;
    if (userIdAttribute)
      data.LDAPService.SearchSettings.UsernameAttribute = userIdAttribute;

    if (activeDirectoryEnabled) {
      return await dispatch('saveActiveDirectorySettings', data);
    } else {
      return await dispatch('saveLdapSettings', data);
    }
  },
  async addNewRoleGroup(
    {
      dispatch,
      getters,
    }: ActionContext<ActionNames, Multations, State, Getters>,
    { groupName, groupPrivilege }: { groupName: string; groupPrivilege: string }
  ) {
    const data: { [index: string]: any } = {};
    const enabledRoleGroups = getters['enabledRoleGroups'];
    const isActiveDirectoryEnabled = getters['isActiveDirectoryEnabled'];
    const RemoteRoleMapping = [
      ...enabledRoleGroups,
      {
        LocalRole: groupPrivilege,
        RemoteGroup: groupName,
      },
    ];
    if (isActiveDirectoryEnabled) {
      data.ActiveDirectory = { RemoteRoleMapping };
    } else {
      data.LDAP = { RemoteRoleMapping };
    }
    return await api
      .patch('/redfish/v1/AccountService', data)
      .then(() => dispatch('getAccountSettings'))
      .then(() =>
        i18n.t('pageLdap.toast.successAddRoleGroup', {
          groupName,
        })
      )
      .catch((error) => {
        console.log(error);
        throw new Error(i18n.t('pageLdap.toast.errorAddRoleGroup') as string);
      });
  },
  async saveRoleGroup(
    {
      dispatch,
      getters,
    }: ActionContext<ActionNames, Multations, State, Getters>,
    { groupName, groupPrivilege }: { groupName: string; groupPrivilege: string }
  ) {
    const data: { [index: string]: any } = {};
    const enabledRoleGroups = getters['enabledRoleGroups'];
    const isActiveDirectoryEnabled = getters['isActiveDirectoryEnabled'];
    const RemoteRoleMapping = enabledRoleGroups.map(
      (group: { RemoteGroup: any }) => {
        if (group.RemoteGroup === groupName) {
          return {
            RemoteGroup: groupName,
            LocalRole: groupPrivilege,
          };
        } else {
          return {};
        }
      }
    );
    if (isActiveDirectoryEnabled) {
      data.ActiveDirectory = { RemoteRoleMapping };
    } else {
      data.LDAP = { RemoteRoleMapping };
    }
    return await api
      .patch('/redfish/v1/AccountService', data)
      .then(() => dispatch('getAccountSettings'))
      .then(() => i18n.t('pageLdap.toast.successSaveRoleGroup', { groupName }))
      .catch((error) => {
        console.log(error);
        throw new Error(i18n.t('pageLdap.toast.errorSaveRoleGroup') as string);
      });
  },
  async deleteRoleGroup(
    {
      dispatch,
      getters,
    }: ActionContext<ActionNames, Multations, State, Getters>,
    { roleGroups = [] }
  ) {
    const data: { [index: string]: any } = {};
    const enabledRoleGroups = getters['enabledRoleGroups'];
    const isActiveDirectoryEnabled = getters['isActiveDirectoryEnabled'];
    const RemoteRoleMapping = enabledRoleGroups.map(
      (group: { RemoteGroup: any }) => {
        if (find(roleGroups, { groupName: group.RemoteGroup })) {
          return null;
        } else {
          return {};
        }
      }
    );
    if (isActiveDirectoryEnabled) {
      data.ActiveDirectory = { RemoteRoleMapping };
    } else {
      data.LDAP = { RemoteRoleMapping };
    }
    return await api
      .patch('/redfish/v1/AccountService', data)
      .then(() => dispatch('getAccountSettings'))
      .then(() =>
        i18n.tc('pageLdap.toast.successDeleteRoleGroup', roleGroups.length)
      )
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.tc('pageLdap.toast.errorDeleteRoleGroup', roleGroups.length)
        );
      });
  },
};

const LdapStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default LdapStore;
