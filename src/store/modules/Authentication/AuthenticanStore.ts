import api from '@/store/api';
import Cookies from 'js-cookie';
import router from '@/router';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  authError: false,
  xsrfCookie: Cookies.get('XSRF-TOKEN'),
  isAuthenticatedCookie: Cookies.get('IsAuthenticated'),
};
type State = typeof state;

const getters = {
  authError: (state: State) => state.authError,
  isLoggedIn: (state: {
    xsrfCookie: undefined;
    isAuthenticatedCookie: string;
  }) => {
    return (
      state.xsrfCookie !== undefined || state.isAuthenticatedCookie == 'true'
    );
  },
  token: (state: State) => state.xsrfCookie,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  authSuccess(state: State) {
    state.authError = false;
    state.xsrfCookie = Cookies.get('XSRF-TOKEN');
  },
  authError(state: State, authError = true) {
    state.authError = authError;
  },
  logout(state: State) {
    Cookies.remove('XSRF-TOKEN');
    Cookies.remove('IsAuthenticated');
    localStorage.removeItem('storedUsername');
    state.xsrfCookie = undefined;
    state.isAuthenticatedCookie = undefined;
  },
};

type Multations = keyof typeof mutations;

const actionsNames = [
  'login',
  'logout',
  'checkPasswordChangeRequired',
  'resetStoreState',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  login(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
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
  logout({ commit }: ActionContext<ActionNames, Multations, State, Getters>) {
    api
      .post('/logout', { data: [] }, undefined)
      .then(() => commit('logout'))
      .then(() => router.go('/login' as any))
      .catch((error) => console.log(error));
  },
  async checkPasswordChangeRequired(
    _: ActionContext<ActionNames, Multations, State, Getters>,
    username: any
  ) {
    return await api
      .get(`/redfish/v1/AccountService/Accounts/${username}`)
      .then(({ data: { PasswordChangeRequired } }) => PasswordChangeRequired)
      .catch((error) => console.log(error));
  },
  resetStoreState({
    state,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    state.authError = false;
    state.xsrfCookie = Cookies.get('XSRF-TOKEN');
    state.isAuthenticatedCookie = Cookies.get('IsAuthenticated');
  },
};

const AuthenticationStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default AuthenticationStore;
