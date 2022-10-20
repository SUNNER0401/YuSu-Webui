import Axios, { AxiosRequestConfig } from 'axios';
//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import store from '.';

const api = Axios.create({
  withCredentials: true,
});

api.interceptors.response.use(undefined, (error) => {
  let response = error.response;

  // TODO: Provide user with a notification and way to keep system active
  if (response.status == 401) {
    if (response.config.url != '/login') {
      let currentPathname = window.location.hash.split('#')[1];
      localStorage.setItem('LastPathname', currentPathname);
      window.location = ('/login' as unknown) as Location;
      // Commit logout to remove XSRF-TOKEN cookie
      store.commit('authentication/logout');
    }
  }

  if (response.status == 403) {
    // Check if action is unauthorized.
    // Toast error message will appear on screen
    // when the action is unauthorized.
    store.commit('global/setUnauthorized');
  }

  return Promise.reject(error);
});

export default {
  get(path: string) {
    return api.get(path);
  },
  delete(path: string, payload: AxiosRequestConfig | undefined) {
    return api.delete(path, payload);
  },
  post(path: string, payload: any, config: AxiosRequestConfig | undefined) {
    return api.post(path, payload, config);
  },
  patch(path: string, payload: any) {
    return api.patch(path, payload);
  },
  put(path: string, payload: any) {
    return api.put(path, payload);
  },
  all(promises: unknown[]) {
    return Axios.all(promises);
  },
  spread(callback: (...args: unknown[]) => unknown) {
    return Axios.spread(callback);
  },
};

export const getResponseCount = (responses: any[]) => {
  let successCount = 0;
  let errorCount = 0;

  responses.forEach((response) => {
    if (response instanceof Error) errorCount++;
    else successCount++;
  });

  return {
    successCount,
    errorCount,
  };
};
