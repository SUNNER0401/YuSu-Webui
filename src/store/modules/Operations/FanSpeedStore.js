import api from '@/store/api';
import { cloneDeep } from 'lodash';

const FanSpeedStore = {
  namespaced: true,
  state: {
    fanSpeeds: {},
    fanNames: [],
    fanUrls: [],
    pwmUrls: [],
    pwmValues: {},
    pwmRelation: {},
    fanModes: {},
    allModes: [],
    zones: {},
  },
  getters: {
    fanSpeeds: (state) => state.fanSpeeds,
    fanNames: (state) => state.fanNames,
    fanUrls: (state) => state.fanUrls,
    pwmUrls: (state) => state.pwmUrls,
    pwmValues: (state) => state.pwmValues,
    pwmRelation: (state) => state.pwmRelation,
    fanModes: (state) => state.fanModes,
    allModes: (state) => state.allModes,
    zones: (state) => state.zones,
  },
  mutations: {
    getAllFanUrls(state, urls) {
      state.fanUrls = urls;
    },
    getFanModeInfo(state, { zoneName, currentmode }) {
      state.fanModes[zoneName] = currentmode;
      state.fanModes = cloneDeep(state.fanModes);
      // The above code cannot be ignored, otherwise you will lose the
      // ability to watch vuex object type data.Because vue cannot watch
      // properties which are pushed into object after first created time.
    },
    getFanSpeeds(state, fanSpeeds) {
      state.fanSpeeds = fanSpeeds;
    },
    getAllModes(state, allModes) {
      state.allModes = allModes;
    },
    getFanName(state, fanNames) {
      state.fanNames = fanNames;
    },
    getZones(state, zones) {
      state.zones = zones;
    },
    getAllPwmUrls(state, allPwmUrls) {
      state.pwmUrls = allPwmUrls;
    },
    getPwmValues(state, allPwmValues) {
      state.pwmValues = allPwmValues;
    },
    getPwmRelation(state, pwmRelation) {
      state.pwmRelation = pwmRelation;
    },
  },
  actions: {
    async getFanAllData({ dispatch, state }) {
      let promise1 = dispatch('getAllPwmValues');
      let promise2 = dispatch('getAllFanUrls');
      await Promise.all([promise1, promise2]);
      await dispatch('getFanInfo');
      let promises = [];
      Object.keys(state.zones).forEach((zoneName) => {
        let promise3 = dispatch('getFanModeInfo', zoneName);
        promises.push(promise3);
      });
      await Promise.all(promises);
    },
    async setFanMode({ dispatch, state }, { zoneName, mode }) {
      let index = zoneName.search(/zone/);
      let zoneId = zoneName[index + 'zone'.length];
      const Supported = state.allModes;
      if (!Supported.includes(mode)) {
        console.log('wrong mode!!!');
        return;
      }
      const data = JSON.stringify({ data: mode });
      let promise = api
        .put(
          '/xyz/openbmc_project/control/thermal/' + zoneId + '/attr/Current',
          data
        )
        .catch((error) => {
          throw error;
        });
      await Promise.all([promise]);
      dispatch('getFanSpeeds');
      dispatch('getFanModeInfo', zoneName);
    },
    getFanModeInfo({ commit }, zoneName) {
      let index = zoneName.search(/zone/);
      let zoneId = zoneName[index + 'zone'.length];
      api
        .get(`/xyz/openbmc_project/control/thermal/${zoneId}`)
        .then(({ data: { data } }) => {
          commit('getFanModeInfo', { zoneName, currentmode: data.Current });
          commit('getAllModes', data.Supported);
        });
    },
    getAllFanUrls({ commit }) {
      return api
        .get('/xyz/openbmc_project/sensors/fan_tach/')
        .then(({ data: { data } }) => {
          let fanNames = [];
          data.forEach((item) => {
            let fanName = item.split('/')[item.split('/').length - 1];
            fanNames.push(fanName);
          });
          commit('getFanName', fanNames);
          commit('getAllFanUrls', data);
        });
    },
    async getFanInfo({ dispatch, commit, state }) {
      let fanUrls = state.fanUrls;
      let promises = [];
      let fanSpeeds = {};
      let pwmRelation = {};
      let zones = {};
      for (let url of fanUrls) {
        let fanName = url.split('/fan_tach/')[1];
        let promise = api.get(url).then(async ({ data: { data } }) => {
          if (!data.Value) {
            fanSpeeds[fanName] = 0;
          } else {
            fanSpeeds[fanName] = parseInt(data.Value);
          }
          let assurl = data.Associations[0][2];
          let currentFan = fanName;
          let { pwmName, zone } = await dispatch('getZoneAndPwmRelation', {
            assurl,
            currentFan,
          });
          if (!Object.prototype.hasOwnProperty.call(zones, zone)) {
            zones[zone] = [];
          }
          zones[zone].push(fanName);
          pwmRelation[fanName] = pwmName;
        });
        promises.push(promise);
      }
      await Promise.all(promises);
      commit('getFanSpeeds', fanSpeeds);
      // sort items of zones by key
      let sorttedZones = {};
      let zonesName = Object.keys(zones).sort();
      zonesName.forEach((zoneName) => {
        sorttedZones[zoneName] = zones[zoneName];
      });
      zones = sorttedZones;
      commit('getZones', zones);
      commit('getPwmRelation', pwmRelation);
    },
    async getFanSpeeds({ commit, state }) {
      let fanUrls = state.fanUrls;
      let promises = [];
      let fanSpeeds = {};
      for (let url of fanUrls) {
        let fanName = url.split('/fan_tach/')[1];
        let promise = api.get(url).then(async ({ data: { data } }) => {
          if (!data.Value) {
            fanSpeeds[fanName] = 0;
          } else {
            fanSpeeds[fanName] = parseInt(data.Value);
          }
        });
        promises.push(promise);
      }
      await Promise.all(promises);
      commit('getFanSpeeds', fanSpeeds);
    },
    // Obtain contorl zones of each fan.
    async getAllPwmUrls({ commit }) {
      let promise = api
        .get('/xyz/openbmc_project/sensors/fan_pwm/')
        .then(({ data: { data } }) => {
          commit('getAllPwmUrls', data);
        });
      await Promise.all([promise]);
    },
    async getAllPwmValues({ dispatch, commit, state }) {
      await dispatch('getAllPwmUrls');
      let pwmUrls = state.pwmUrls;
      let pwmValues = {};
      let promises = [];
      pwmUrls.forEach((url) => {
        let pwmName = url.split('/')[url.split('/').length - 1];
        let promise = api.get(url).then(
          ({
            data: {
              data: { Value },
            },
          }) => {
            pwmValues[pwmName] = parseInt(Value);
          }
        );
        promises.push(promise);
      });
      await Promise.all(promises);
      commit('getPwmValues', pwmValues);
    },
    async getZoneAndPwmRelation(_, { assurl, currentFan }) {
      let pwmName;
      let zone;
      let promises = [];
      await api.get(assurl + '/').then(({ data: { data } }) => {
        let fan_urls = data.filter((item) => {
          let tailName = item.split('/')[item.split('/').length - 1];
          if (currentFan == tailName) {
            return item;
          }
        });
        let url = fan_urls[0];
        let promise = api.get(url).then(({ data: { data } }) => {
          [pwmName, zone] = [data.PwmName, data.Zone];
        });
        promises.push(promise);
      });
      await Promise.all(promises);
      return { pwmName, zone };
    },
    // This function only can bu used in manual mode.
    async setPwmValue({ dispatch }, { pwmName, value }) {
      const data = JSON.stringify({ data: value });
      await api
        .put(`/xyz/openbmc_project/sensors/fan_pwm/${pwmName}/attr/Value`, data)
        .catch((error) => {
          throw error;
        });
      dispatch('getFanSpeeds');
    },
  },
};
export default FanSpeedStore;
