import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '@/types/store';

const state = {
  allUsers: [],
  accountRoles: [],
  accountLockoutDuration: null,
  accountLockoutThreshold: null,
  accountMinPasswordLength: null,
  accountMaxPasswordLength: null,
};
type State = typeof state;

const getters = {
  allUsers(state: State) {
    return state.allUsers;
  },
  accountRoles(state: State) {
    return state.accountRoles;
  },
  accountSettings(state: State) {
    return {
      lockoutDuration: state.accountLockoutDuration,
      lockoutThreshold: state.accountLockoutThreshold,
    };
  },
  accountPasswordRequirements(state: State) {
    return {
      minLength: state.accountMinPasswordLength,
      maxLength: state.accountMaxPasswordLength,
    };
  },
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setUsers(state: State, allUsers: any) {
    state.allUsers = allUsers;
  },
  setAccountRoles(state: State, accountRoles: any) {
    state.accountRoles = accountRoles;
  },
  setLockoutDuration(state: State, lockoutDuration: any) {
    state.accountLockoutDuration = lockoutDuration;
  },
  setLockoutThreshold(state: State, lockoutThreshold: any) {
    state.accountLockoutThreshold = lockoutThreshold;
  },
  setAccountMinPasswordLength(state: State, minPasswordLength: any) {
    state.accountMinPasswordLength = minPasswordLength;
  },
  setAccountMaxPasswordLength(state: State, maxPasswordLength: any) {
    state.accountMaxPasswordLength = maxPasswordLength;
  },
};
type Multations = keyof typeof mutations;

const actionsNames = [
  'getUsers',
  'getAccountSettings',
  'getAccountRoles',
  'createUser',
  'updateUser',
  'deleteUser',
  'deleteUsers',
  'enableUsers',
  'disableUsers',
  'saveAccountSettings',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getUsers({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/AccountService/Accounts')
      .then((response) =>
        response.data.Members.map(
          (user: { [x: string]: any }) => user['@odata.id']
        )
      )
      .then((userIds) => api.all(userIds.map((user: string) => api.get(user))))
      .then((users: any[]) => {
        const userData = users.map((user) => user.data);
        commit('setUsers', userData);
      })
      .catch((error) => {
        console.log(error);
        const message = i18n.t('pageUserManagement.toast.errorLoadUsers');
        throw new Error(message as string);
      });
  },
  getAccountSettings({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    api
      .get('/redfish/v1/AccountService')
      .then(({ data }) => {
        commit('setLockoutDuration', data.AccountLockoutDuration);
        commit('setLockoutThreshold', data.AccountLockoutThreshold);
        commit('setAccountMinPasswordLength', data.MinPasswordLength);
        commit('setAccountMaxPasswordLength', data.MaxPasswordLength);
      })
      .catch((error) => {
        console.log(error);
        const message = i18n.t(
          'pageUserManagement.toast.errorLoadAccountSettings'
        );
        throw new Error(message as string);
      });
  },
  getAccountRoles({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    api
      .get('/redfish/v1/AccountService/Roles')
      .then(({ data: { Members = [] } = {} }) => {
        const roles = Members.map((role: { [x: string]: string }) => {
          return role['@odata.id'].split('/').pop();
        });
        commit('setAccountRoles', roles);
      })
      .catch((error) => console.log(error));
  },
  async createUser(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    {
      username,
      password,
      privilege,
      status,
      maxdaysexpired,
    }: {
      username: string;
      password: string;
      privilege: string;
      status: string;
      maxdaysexpired: number;
    }
  ) {
    const data = {
      UserName: username,
      Password: password,
      RoleId: privilege,
      Enabled: status,
      PasswordExpirationDays: +maxdaysexpired,
    };
    return await api
      .post('/redfish/v1/AccountService/Accounts', data, undefined)
      .then(() => dispatch('getUsers'))
      .then(() =>
        i18n.t('pageUserManagement.toast.successCreateUser', {
          username,
        })
      )
      .catch((error) => {
        console.log(error);
        const message = i18n.t('pageUserManagement.toast.errorCreateUser', {
          username,
        });
        throw new Error(message as string);
      });
  },
  async updateUser(
    { dispatch, state }: ActionContext<ActionNames, Multations, State, Getters>,
    {
      originalUsername,
      username,
      password,
      privilege,
      status,
      locked,
      maxdaysexpired,
    }: {
      originalUsername: string;
      username: string;
      password: string;
      privilege: string;
      status: string;
      locked: string;
      maxdaysexpired: string;
    }
  ) {
    const data: { [index: string]: any } = {};
    if (username) data.UserName = username;
    if (password) data.Password = password;
    if (privilege) {
      if (privilege != 'Administrator') {
        // Count administrators.
        let adminCount = 0;
        let curUser: { [index: string]: string } = {};
        state.allUsers.forEach((item: { RoleId: string; UserName: string }) => {
          if (item.RoleId == 'Administrator') {
            adminCount++;
          }
          if (item.UserName == originalUsername) {
            curUser = item;
            return;
          }
        });
        // Prevent make adminCount < 1
        if (adminCount <= 1) {
          if (curUser.RoleId == 'Administrator') {
            let message = i18n.t('pageUserManagement.toast.errorUpdateUser', {
              username: originalUsername,
            });
            throw new Error(message as string);
          }
        }
      }
      data.RoleId = privilege;
    }
    if (status !== undefined) data.Enabled = status;
    if (locked !== undefined) data.Locked = locked;
    if (maxdaysexpired) data.PasswordExpirationDays = +maxdaysexpired;
    return await api
      .patch(`/redfish/v1/AccountService/Accounts/${originalUsername}`, data)
      .then(() => dispatch('getUsers'))
      .then(() =>
        i18n.t('pageUserManagement.toast.successUpdateUser', {
          username: originalUsername,
        })
      )
      .catch((error) => {
        console.log(error);
        const message = i18n.t('pageUserManagement.toast.errorUpdateUser', {
          username: originalUsername,
        });
        throw new Error(message as string);
      });
  },
  async deleteUser(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    username: any
  ) {
    return await api
      .delete(`/redfish/v1/AccountService/Accounts/${username}`, undefined)
      .then(() => dispatch('getUsers'))
      .then(() =>
        i18n.t('pageUserManagement.toast.successDeleteUser', {
          username,
        })
      )
      .catch((error) => {
        console.log(error);
        const message = i18n.t('pageUserManagement.toast.errorDeleteUser', {
          username,
        });
        throw new Error(message as string);
      });
  },
  async deleteUsers(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    users: { username: any }[]
  ) {
    const promises = users.map(({ username }) => {
      return api
        .delete(`/redfish/v1/AccountService/Accounts/${username}`, undefined)
        .catch((error) => {
          console.log(error);
          return error;
        });
    });
    return await api
      .all(promises)
      .then((response) => {
        dispatch('getUsers');
        return response;
      })
      .then(
        api.spread((...responses) => {
          const { successCount, errorCount } = getResponseCount(responses);
          let toastMessages = [];

          if (successCount) {
            const message = i18n.tc(
              'pageUserManagement.toast.successBatchDelete',
              successCount
            );
            toastMessages.push({ type: 'success', message });
          }

          if (errorCount) {
            const message = i18n.tc(
              'pageUserManagement.toast.errorBatchDelete',
              errorCount
            );
            toastMessages.push({ type: 'error', message });
          }

          return toastMessages;
        })
      );
  },
  async enableUsers(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    users: { username: any }[]
  ) {
    const data = {
      Enabled: true,
    };
    const promises = users.map(({ username }) => {
      return api
        .patch(`/redfish/v1/AccountService/Accounts/${username}`, data)
        .catch((error) => {
          console.log(error);
          return error;
        });
    });
    return await api
      .all(promises)
      .then((response) => {
        dispatch('getUsers');
        return response;
      })
      .then(
        api.spread((...responses) => {
          const { successCount, errorCount } = getResponseCount(responses);
          let toastMessages = [];

          if (successCount) {
            const message = i18n.tc(
              'pageUserManagement.toast.successBatchEnable',
              successCount
            );
            toastMessages.push({ type: 'success', message });
          }

          if (errorCount) {
            const message = i18n.tc(
              'pageUserManagement.toast.errorBatchEnable',
              errorCount
            );
            toastMessages.push({ type: 'error', message });
          }

          return toastMessages;
        })
      );
  },
  async disableUsers(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    users: { username: any }[]
  ) {
    const data = {
      Enabled: false,
    };
    const promises = users.map(({ username }) => {
      return api
        .patch(`/redfish/v1/AccountService/Accounts/${username}`, data)
        .catch((error) => {
          console.log(error);
          return error;
        });
    });
    return await api
      .all(promises)
      .then((response) => {
        dispatch('getUsers');
        return response;
      })
      .then(
        api.spread((...responses) => {
          const { successCount, errorCount } = getResponseCount(responses);
          let toastMessages = [];

          if (successCount) {
            const message = i18n.tc(
              'pageUserManagement.toast.successBatchDisable',
              successCount
            );
            toastMessages.push({ type: 'success', message });
          }

          if (errorCount) {
            const message = i18n.tc(
              'pageUserManagement.toast.errorBatchDisable',
              errorCount
            );
            toastMessages.push({ type: 'error', message });
          }

          return toastMessages;
        })
      );
  },
  async saveAccountSettings(
    { dispatch }: ActionContext<ActionNames, Multations, State, Getters>,
    { lockoutThreshold, lockoutDuration }: any
  ) {
    const data: { [index: string]: any } = {};
    if (lockoutThreshold !== undefined) {
      data.AccountLockoutThreshold = lockoutThreshold;
    }
    if (lockoutDuration !== undefined) {
      data.AccountLockoutDuration = lockoutDuration;
    }

    return await api
      .patch('/redfish/v1/AccountService', data)
      //GET new settings to update view
      .then(() => dispatch('getAccountSettings'))
      .then(() => i18n.t('pageUserManagement.toast.successSaveSettings'))
      .catch((error) => {
        console.log(error);
        const message = i18n.t('pageUserManagement.toast.errorSaveSettings');
        throw new Error(message as string);
      });
  },
};

const UserManagementStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default UserManagementStore;
