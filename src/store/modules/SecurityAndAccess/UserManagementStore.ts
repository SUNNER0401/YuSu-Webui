import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const UserManagementStore = {
  namespaced: true,
  state: {
    allUsers: [],
    accountRoles: [],
    accountLockoutDuration: null,
    accountLockoutThreshold: null,
    accountMinPasswordLength: null,
    accountMaxPasswordLength: null,
  },
  getters: {
    allUsers(state: { allUsers: any }) {
      return state.allUsers;
    },
    accountRoles(state: { accountRoles: any }) {
      return state.accountRoles;
    },
    accountSettings(state: {
      accountLockoutDuration: any;
      accountLockoutThreshold: any;
    }) {
      return {
        lockoutDuration: state.accountLockoutDuration,
        lockoutThreshold: state.accountLockoutThreshold,
      };
    },
    accountPasswordRequirements(state: {
      accountMinPasswordLength: any;
      accountMaxPasswordLength: any;
    }) {
      return {
        minLength: state.accountMinPasswordLength,
        maxLength: state.accountMaxPasswordLength,
      };
    },
  },
  mutations: {
    setUsers(state: { allUsers: any }, allUsers: any) {
      state.allUsers = allUsers;
    },
    setAccountRoles(state: { accountRoles: any }, accountRoles: any) {
      state.accountRoles = accountRoles;
    },
    setLockoutDuration(
      state: { accountLockoutDuration: any },
      lockoutDuration: any
    ) {
      state.accountLockoutDuration = lockoutDuration;
    },
    setLockoutThreshold(
      state: { accountLockoutThreshold: any },
      lockoutThreshold: any
    ) {
      state.accountLockoutThreshold = lockoutThreshold;
    },
    setAccountMinPasswordLength(
      state: { accountMinPasswordLength: any },
      minPasswordLength: any
    ) {
      state.accountMinPasswordLength = minPasswordLength;
    },
    setAccountMaxPasswordLength(
      state: { accountMaxPasswordLength: any },
      maxPasswordLength: any
    ) {
      state.accountMaxPasswordLength = maxPasswordLength;
    },
  },
  actions: {
    async getUsers({ commit }: any) {
      return await api
        .get('/redfish/v1/AccountService/Accounts')
        .then((response) =>
          response.data.Members.map(
            (user: { [x: string]: any }) => user['@odata.id']
          )
        )
        .then((userIds) =>
          api.all(userIds.map((user: string) => api.get(user)))
        )
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
    getAccountSettings({ commit }: any) {
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
    getAccountRoles({ commit }: any) {
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
      { dispatch }: any,
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
      { dispatch, state }: any,
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
          state.allUsers.forEach(
            (item: { RoleId: string; UserName: string }) => {
              if (item.RoleId == 'Administrator') {
                adminCount++;
              }
              if (item.UserName == originalUsername) {
                curUser = item;
                return;
              }
            }
          );
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
    async deleteUser({ dispatch }: any, username: any) {
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
    async deleteUsers({ dispatch }: any, users: { username: any }[]) {
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
    async enableUsers({ dispatch }: any, users: { username: any }[]) {
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
    async disableUsers({ dispatch }: any, users: { username: any }[]) {
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
      { dispatch }: any,
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
  },
};

export default UserManagementStore;
