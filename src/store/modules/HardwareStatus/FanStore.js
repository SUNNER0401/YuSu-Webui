import api from '@/store/api';

const FanStore = {
  namespaced: true,
  state: {
    fans: [],
  },
  getters: {
    fans: (state) => state.fans,
  },
  mutations: {
    setFanInfo: (state, data) => {
      state.fans = data.map((fan) => {
        const {
          IndicatorLED,
          Location,
          MemberId,
          Name,
          Reading,
          ReadingUnits,
          Status = {},
          PartNumber,
          SerialNumber,
        } = fan;
        return {
          id: MemberId,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          healthRollup: Status.HealthRollup,
          identifyLed: IndicatorLED,
          locationNumber: Location,
          name: Name,
          speed: Reading + ' ' + ReadingUnits,
          statusState: Status.State,
        };
      });
    },
  },
  actions: {
    async getFanInfo({ commit }) {
      const collection = await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => {
          console.log(error);
        });
      if (!collection) return;
      const fansInfo = [];
      await api
        .all(
          collection.map((chassis) => {
            return api
              .get(`${chassis}/Thermal`)
              .then(({ data: { Fans = [] } }) => {
                fansInfo.push(...Fans);
              });
          })
        )
        .catch((error) => console.log(error));
      commit('setFanInfo', fansInfo);
    },
  },
};

export default FanStore;
