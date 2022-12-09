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
    fanSpeeds: (state: { fanSpeeds: any }) => state.fanSpeeds,
    fanNames: (state: { fanNames: any }) => state.fanNames,
    fanUrls: (state: { fanUrls: any }) => state.fanUrls,
    pwmUrls: (state: { pwmUrls: any }) => state.pwmUrls,
    pwmValues: (state: { pwmValues: any }) => state.pwmValues,
    pwmRelation: (state: { pwmRelation: any }) => state.pwmRelation,
    fanModes: (state: { fanModes: any }) => state.fanModes,
    allModes: (state: { allModes: any }) => state.allModes,
    zones: (state: { zones: any }) => state.zones,
  },
  mutations: {
    getAllFanUrls(state: { fanUrls: any }, urls: any) {
      state.fanUrls = urls;
    },
    getFanModeInfo(
      state: { fanModes: { [x: string]: any } },
      { zoneName, currentmode }: any
    ) {
      state.fanModes[zoneName] = currentmode;
      state.fanModes = cloneDeep(state.fanModes);
      // The above code cannot be ignored, otherwise you will lose the
      // ability to watch vuex object type data.Because vue cannot watch
      // properties which are pushed into object after first created time.
    },
    getFanSpeeds(state: { fanSpeeds: any }, fanSpeeds: any) {
      state.fanSpeeds = fanSpeeds;
    },
    getAllModes(state: { allModes: any }, allModes: any) {
      state.allModes = allModes;
    },
    getFanName(state: { fanNames: any }, fanNames: any) {
      state.fanNames = fanNames;
    },
    getZones(state: { zones: any }, zones: any) {
      state.zones = zones;
    },
    getAllPwmUrls(state: { pwmUrls: any }, allPwmUrls: any) {
      state.pwmUrls = allPwmUrls;
    },
    getPwmValues(state: { pwmValues: any }, allPwmValues: any) {
      state.pwmValues = allPwmValues;
    },
    getPwmRelation(state: { pwmRelation: any }, pwmRelation: any) {
      state.pwmRelation = pwmRelation;
    },
  },
  actions: {
    async getFanAllData({ dispatch, state }: any) {
      let promise1 = dispatch('getAllPwmValues');
      let promise2 = dispatch('getAllFanUrls');
      await Promise.all([promise1, promise2]);
      await dispatch('getFanInfo');
      let promises: any[] = [];
      Object.keys(state.zones).forEach((zoneName) => {
        let promise3 = dispatch('getFanModeInfo', zoneName);
        promises.push(promise3);
      });
      await Promise.all(promises);
    },
    async setFanMode(
      { dispatch, state }: any,
      { zoneName, mode }: { zoneName: string; mode: string }
    ) {
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
    getFanModeInfo({ commit }: any, zoneName: string) {
      let index = zoneName.search(/zone/);
      let zoneId = zoneName[index + 'zone'.length];
      api
        .get(`/xyz/openbmc_project/control/thermal/${zoneId}`)
        .then(({ data: { data } }) => {
          commit('getFanModeInfo', { zoneName, currentmode: data.Current });
          commit('getAllModes', data.Supported);
        });
    },
    getAllFanUrls({ commit }: any) {
      return api
        .get('/xyz/openbmc_project/sensors/fan_tach/')
        .then(({ data: { data } }) => {
          let fanNames: any[] = [];
          data.forEach((item: string) => {
            let fanName = item.split('/')[item.split('/').length - 1];
            fanNames.push(fanName);
          });
          commit('getFanName', fanNames);
          commit('getAllFanUrls', data);
        });
    },
    async getFanInfo({ dispatch, commit, state }: any) {
      let fanUrls = state.fanUrls;
      let promises = [];
      let fanSpeeds: { [index: string]: any } = {};
      let pwmRelation: { [index: string]: any } = {};
      let zones: { [index: string]: any } = {};
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
      let temp: { [index: string]: number } = {};
      let fanNameList = Object.keys(fanSpeeds);
      fanNameList.sort((a, b) => {
        return a > b ? 1 : -1;
      });
      fanNameList.forEach((name) => {
        temp[name] = fanSpeeds[name];
      });
      fanSpeeds = Object.assign({}, temp);
      commit('getFanSpeeds', fanSpeeds);
      // sort items of zones by key
      let sorttedZones: { [index: string]: any } = {};
      let zonesName = Object.keys(zones).sort();
      zonesName.forEach((zoneName) => {
        sorttedZones[zoneName] = zones[zoneName];
      });
      zones = sorttedZones;
      commit('getZones', zones);
      commit('getPwmRelation', pwmRelation);
    },
    async getFanSpeeds({ commit, state }: any) {
      let fanUrls = state.fanUrls;
      let promises = [];
      let fanSpeeds: { [index: string]: any } = {};
      for (let url of fanUrls) {
        let fanName = url.split('/fan_tach/')[1];
        fanSpeeds[fanName] = 0;
        let promise = api.get(url).then(async ({ data: { data } }) => {
          if (data.Value) fanSpeeds[fanName] = parseInt(data.Value);
        });
        promises.push(promise);
      }
      await Promise.all(promises);
      commit('getFanSpeeds', fanSpeeds);
    },
    // Obtain contorl zones of each fan.
    async getAllPwmUrls({ commit }: any) {
      let promise = api
        .get('/xyz/openbmc_project/sensors/fan_pwm/')
        .then(({ data: { data } }) => {
          commit('getAllPwmUrls', data);
        });
      await Promise.all([promise]);
    },
    async getAllPwmValues({ dispatch, commit, state }: any) {
      await dispatch('getAllPwmUrls');
      let pwmUrls = state.pwmUrls;
      let pwmValues: { [index: string]: any } = {};
      let promises: Promise<void>[] = [];
      pwmUrls.forEach((url: string) => {
        let pwmName = url.split('/')[url.split('/').length - 1];
        pwmValues[pwmName] = 0;
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
    async getZoneAndPwmRelation(_: any, { assurl, currentFan }: any) {
      let pwmName;
      let zone;
      let promises: any[] = [];
      await api.get(assurl + '/').then(({ data: { data } }) => {
        let fan_urls = data.filter((item: string) => {
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
    async setPwmValue(
      { dispatch }: any,
      { pwmName, value }: { pwmName: string; value: number }
    ) {
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
