import api from '@/store/api';
import i18n from '@/i18n';
import { ReturnGetters, ActionContext } from '../../../types/store';

const state = {
  ntpServers: [],
  isNtpProtocolEnabled: null,
};
type State = typeof state;

const getters = {
  ntpServers: (state: State) => state.ntpServers,
  isNtpProtocolEnabled: (state: State) => state.isNtpProtocolEnabled,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setNtpServers: (state: State, ntpServers: any) =>
    (state.ntpServers = ntpServers),
  setIsNtpProtocolEnabled: (state: State, isNtpProtocolEnabled: any) =>
    (state.isNtpProtocolEnabled = isNtpProtocolEnabled),
};
type Multations = keyof typeof mutations;

const actionsNames = ['getNtpData', 'updateDateTime'] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getNtpData({
    commit,
  }: ActionContext<ActionNames, Multations, State, Getters>) {
    return await api
      .get('/redfish/v1/Managers/bmc/NetworkProtocol')
      .then((response) => {
        const ntpServers = response.data.NTP.NTPServers;
        const isNtpProtocolEnabled = response.data.NTP.ProtocolEnabled;
        commit('setNtpServers', ntpServers);
        commit('setIsNtpProtocolEnabled', isNtpProtocolEnabled);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  async updateDateTime(
    { state }: ActionContext<ActionNames, Multations, State, Getters>,
    dateTimeForm: {
      ntpProtocolEnabled: any;
      ntpServersArray: any;
      updatedDateTime: any;
    }
  ) {
    const ntpData: {
      NTP: {
        ProtocolEnabled: boolean;
        NTPServers?: typeof dateTimeForm.ntpServersArray[];
      };
    } = {
      NTP: {
        ProtocolEnabled: dateTimeForm.ntpProtocolEnabled,
      },
    };
    if (dateTimeForm.ntpProtocolEnabled) {
      ntpData.NTP.NTPServers = dateTimeForm.ntpServersArray;
    }
    return await api
      .patch(`/redfish/v1/Managers/bmc/NetworkProtocol`, ntpData)
      .then(async () => {
        if (!dateTimeForm.ntpProtocolEnabled) {
          const dateTimeData = {
            DateTime: dateTimeForm.updatedDateTime,
          };
          /**
           * https://github.com/openbmc/phosphor-time-manager/blob/master/README.md#special-note-on-changing-ntp-setting
           * When time mode is initially set to Manual from NTP,
           * NTP service is disabled and the NTP service is
           * stopping but not stopped, setting time will return an error.
           * There are no responses from backend to notify when NTP is stopped.
           * To work around, a timeout is set to allow NTP to fully stop
           * TODO: remove timeout if backend solves
           * https://github.com/openbmc/openbmc/issues/3459
           */
          const timeoutVal = state.isNtpProtocolEnabled ? 20000 : 0;
          return await new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              return api
                .patch(`/redfish/v1/Managers/bmc`, dateTimeData)
                .then(() => resolve())
                .catch(() => reject());
            }, timeoutVal);
          });
        }
      })
      .then(() => {
        return i18n.t('pageDateTime.toast.successSaveDateTime');
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          i18n.t('pageDateTime.toast.errorSaveDateTime') as string
        );
      });
  },
};

const DateTimeStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default DateTimeStore;
