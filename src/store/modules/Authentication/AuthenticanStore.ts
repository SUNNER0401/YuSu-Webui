import api from '@/store/api';
import Cookies from 'js-cookie';
import router from '@/router';

const AuthenticationStore = {
  namespaced: true,
  state: {
    authError: false,
    xsrfCookie: Cookies.get('XSRF-TOKEN'),
    isAuthenticatedCookie: Cookies.get('IsAuthenticated'),
  },
  getters: {
    authError: (state: { authError: any }) => state.authError,
    isLoggedIn: (state: {
      xsrfCookie: undefined;
      isAuthenticatedCookie: string;
    }) => {
      return (
        state.xsrfCookie !== undefined || state.isAuthenticatedCookie == 'true'
      );
    },
    token: (state: { xsrfCookie: any }) => state.xsrfCookie,
  },
  mutations: {
    authSuccess(state: { authError: boolean; xsrfCookie: any }) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
    },
    authError(state: { authError: boolean }, authError = true) {
      state.authError = authError;
    },
    logout(state: { xsrfCookie: undefined; isAuthenticatedCookie: undefined }) {
      Cookies.remove('XSRF-TOKEN');
      Cookies.remove('IsAuthenticated');
      localStorage.removeItem('storedUsername');
      state.xsrfCookie = undefined;
      state.isAuthenticatedCookie = undefined;
    },
  },
  actions: {
    login(
      { commit }: any,
      { username, password }: { username: string; password: string }
    ) {
      commit('authError', false);
      return api
        .post('/login', { data: [username, password] }, undefined)
        .then(() => commit('authSuccess'))
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
    },
    logout({ commit }: any) {
      api
        .post('/logout', { data: [] }, undefined)
        .then(() => commit('logout'))
        .then(() => router.go('/login' as any))
        .catch((error) => console.log(error));
    },
    async checkPasswordChangeRequired(_: any, username: any) {
      return await api
        .get(`/redfish/v1/AccountService/Accounts/${username}`)
        .then(({ data: { PasswordChangeRequired } }) => PasswordChangeRequired)
        .catch((error) => console.log(error));
    },
    resetStoreState({ state }: any) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
      state.isAuthenticatedCookie = Cookies.get('IsAuthenticated');
    },
  },
};

export default AuthenticationStore;
