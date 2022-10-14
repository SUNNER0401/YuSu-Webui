/**
 * WebSocketPlugin will allow us to get new data from the server
 * without having to poll for changes on the frontend.
 *
 * This plugin is subscribed to host state property and logging
 * changes, indicated in the app header Health and Power status.
 *
 * https://github.com/openbmc/docs/blob/b41aff0fabe137cdb0cfff584b5fe4a41c0c8e77/rest-api.md#event-subscription-protocol
 */
const WebSocketPlugin = (store: {
  getters: { [x: string]: any };
  dispatch: (arg0: string) => Promise<any>;
  commit: (arg0: string, arg1?: undefined) => void;
  state: { powerControl: { powerChartDataInterval: number | undefined } };
  subscribe: (arg0: ({ type }: { type: any }) => void) => void;
}) => {
  let ws: WebSocket;
  const data = {
    paths: [
      '/xyz/openbmc_project/state/host0',
      '/xyz/openbmc_project/logging',
      '/xyz/openbmc_project/sensors/power/total_power',
    ],
    interfaces: [
      'xyz.openbmc_project.State.Host',
      'xyz.openbmc_project.Logging.Entry',
      'xyz.openbmc_project.Sensor.Value',
    ],
  };

  const initWebSocket = () => {
    const socketDisabled =
      process.env.VUE_APP_SUBSCRIBE_SOCKET_DISABLED === 'true' ? true : false;
    if (socketDisabled) return;
    const token = store.getters['authentication/token'];
    ws = new WebSocket(`wss://${window.location.host}/subscribe`, [token]);
    ws.onopen = async () => {
      ws.send(JSON.stringify(data));
      // Get time when it start to calculate power.
      await store.dispatch('powerControl/getPowerChassisId');
      store.dispatch('powerControl/startCalculate');
      store.dispatch('powerControl/getPowerControl').then(() => {
        store.commit('powerControl/setpowerChartData1');
      });
    };
    ws.onerror = (event) => {
      console.error(event);
      clearInterval(store.state.powerControl.powerChartDataInterval);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const eventInterface = data.interface;
      const path = data.path;

      if (eventInterface === 'xyz.openbmc_project.State.Host') {
        const {
          properties: { CurrentHostState } = {} as { CurrentHostState: any },
        } = data;
        if (CurrentHostState) {
          store.commit('global/setServerStatus', CurrentHostState);
        }
      } else if (path === '/xyz/openbmc_project/logging') {
        store.dispatch('eventLog/getEventLogData');
      }
      if (
        eventInterface === 'xyz.openbmc_project.Sensor.Value' &&
        path === '/xyz/openbmc_project/sensors/power/total_power'
      ) {
        let powerConsumption = data.properties.Value;
        store.commit('powerControl/setPowerConsumptionValue', powerConsumption);
      }
    };
    ws.close = () => {
      clearInterval(store.state.powerControl.powerChartDataInterval);
    };
  };

  store.subscribe(({ type }) => {
    if (type === 'authentication/authSuccess') {
      initWebSocket();
    }
    if (type === 'authentication/logout') {
      if (ws) ws.close();
    }
  });

  if (store.getters['authentication/isLoggedIn']) initWebSocket();
};

export default WebSocketPlugin;
