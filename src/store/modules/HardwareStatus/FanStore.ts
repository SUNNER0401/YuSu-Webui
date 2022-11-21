import api from '@/store/api';

const FanStore = {
  namespaced: true,
  state: {
    fans: [],
  },
  getters: {
    fans: (state: { fans: any }) => state.fans,
  },
  mutations: {
    setFanInfo: (state: { fans: any }, data: any[]) => {
      state.fans = data.map(
        (fan: {
          IndicatorLED: any;
          Location: any;
          MemberId: any;
          Name: any;
          Reading: any;
          ReadingUnits: any;
          Status?: { [index: string]: string } | undefined;
          PartNumber: any;
          SerialNumber: any;
        }) => {
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
        }
      );
    },
  },
  actions: {
    async getFanInfo({ commit }: any) {
      const collection = await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member: { [x: string]: any }) => member['@odata.id'])
        )
        .catch((error) => {
          console.log(error);
        });
      if (!collection) return;
      const fansInfo: any[] = [];
      await api
        .all(
          collection.map((chassis: any) => {
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
