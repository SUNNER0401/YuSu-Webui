import api from '@/store/api';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  fans: [] as any[],
};
type State = typeof state;

const getters = {
  fans: (state: State) => state.fans,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setFanInfo: (state: State, data: any[]) => {
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
};
type Multations = keyof typeof mutations;

const actionsNames = ['getFanInfo'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getFanInfo({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
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
};

const FanStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default FanStore;
