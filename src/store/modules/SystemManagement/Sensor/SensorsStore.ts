import api from '@/store/api';
import { ReturnGetters, ActionContext } from '@/types/store';

function color(item: any) {
  if (item.Value >= item.CriticalHigh) return 'danger';
  else if (item.Value >= item.WarningHigh) return 'warning';
  else if (item.Value >= item.WarningLow) return 'success';
  else if (item.Value > item.CriticalLow) return 'warning';
  else if (item.Value <= item.CriticalLow) return 'danger';
  else return 'light';
}

function status(item: any) {
  if (item.Value >= item.CriticalHigh) return 'Critical';
  else if (item.Value >= item.WarningHigh) return 'Warning';
  else if (item.Value >= item.WarningLow) return 'OK';
  else if (item.Value > item.CriticalLow) return 'Warning';
  else if (item.Value <= item.CriticalLow) return 'Critical';
  else return 'OK';
}

const state = {
  sensors: [] as any[],
};
type State = typeof state;

const getters = {
  sensors: (state: State) => state.sensors,
};
type Getters = ReturnGetters<typeof getters>;

const mutations = {
  setSensors: (state: State, sensors: any[]) => {
    sensors.forEach((item: { name: any }) => {
      for (let i = 0; i < state.sensors.length; i++) {
        if (state.sensors[i].name === item.name) {
          state.sensors.splice(i, 1);
          break;
        }
      }
    });
    state.sensors = [...state.sensors, ...sensors];
  },
};

type Multations = keyof typeof mutations;

const actionsNames = [
  'getAllSensors',
  'getChassisCollection',
  'getSensors',
  'getThermalSensors',
  'getPowerSensors',
] as const;
type ActionNames = typeof actionsNames[number];

const actions = {
  async getAllSensors({ commit }: any) {
    const sensorData: {
      name: string | undefined;
      status: any;
      currentValue: any;
      upperCaution: any;
      lowerCaution: any;
      upperCritical: any;
      lowerCritical: any;
      _rowVariant: any;
    }[] = [];
    await api
      .get('/xyz/openbmc_project/sensors/enumerate')
      .then(({ data: { data } }) => {
        Object.keys(data).forEach((key) => {
          if (key.includes('utilization') == true) {
            return false;
          }
          sensorData.push({
            name: key.split('/').pop(),
            status: status(data[key]),
            currentValue: data[key].Value,
            upperCaution: data[key].WarningHigh,
            lowerCaution: data[key].WarningLow,
            upperCritical: data[key].CriticalHigh,
            lowerCritical: data[key].CriticalLow,
            _rowVariant: color(data[key]),
          });
        });
      })
      .catch((error) => console.log(error));

    await api
      .get('/redfish/v1/Managers/fan/')
      .then((response) => {
        Object.keys(response.data).forEach((key) => {
          sensorData.push({
            name: key,
            status: status(response.data[key]),
            currentValue: response.data[key].Value,
            upperCaution: response.data[key].WarningHigh,
            lowerCaution: response.data[key].WarningLow,
            upperCritical: response.data[key].CriticalHigh,
            lowerCritical: response.data[key].CriticalLow,
            _rowVariant: color(response.data[key]),
          });
        });
      })
      .catch((error) => console.log(error));
    commit('setSensors', sensorData);
    return;
  },
  async getChassisCollection() {
    return await api
      .get('/redfish/v1/Chassis')
      .then(({ data: { Members } }) =>
        Members.map((member: { [x: string]: any }) => member['@odata.id'])
      )
      .catch((error) => console.log(error));
  },
  async getSensors(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    id: any
  ) {
    const sensors = await api
      .get(`${id}/Sensors`)
      .then((response) => response.data.Members)
      .catch((error) => console.log(error));
    if (!sensors) return;
    const promises = sensors.map((sensor: { [x: string]: string }) => {
      return api.get(sensor['@odata.id']).catch((error) => {
        console.log(error);
        return error;
      });
    });
    return await api.all(promises).then(
      api.spread((...responses: any) => {
        const sensorData = responses.map(
          ({ data }: { data: { [index: string]: any } }) => {
            return {
              name: data.Name,
              status: data.Status.Health,
              currentValue: data.Reading,
              lowerCaution: data.Thresholds?.LowerCaution?.Reading,
              upperCaution: data.Thresholds?.UpperCaution?.Reading,
              lowerCritical: data.Thresholds?.LowerCritical?.Reading,
              upperCritical: data.Thresholds?.UpperCritical?.Reading,
              units: data.ReadingUnits,
              type: data.ReadingType,
              memberId: data.Id,
            };
          }
        );
        commit('setSensors', sensorData);
      })
    );
  },
  async getThermalSensors(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    id: any
  ) {
    return await api
      .get(`${id}/Thermal`)
      .then(({ data: { Fans = [], Temperatures = [] } }) => {
        const sensorData: {
          name: any;
          status: any;
          currentValue: any;
          lowerCaution: any;
          upperCaution: any;
          lowerCritical: any;
          upperCritical: any;
          units: any;
          type: any;
          memberId: any;
        }[] = [];
        Fans.forEach(
          (sensor: {
            Name: any;
            Status: { Health: any };
            Reading: any;
            LowerThresholdNonCritical: any;
            UpperThresholdNonCritical: any;
            LowerThresholdCritical: any;
            UpperThresholdCritical: any;
            ReadingUnits: any;
            MemberId: any;
          }) => {
            let fanType = 'fan_pwm';
            if (sensor.ReadingUnits === 'RPM') {
              fanType = 'fan_tach';
            }
            sensorData.push({
              name: sensor.Name,
              status: sensor.Status.Health,
              currentValue: sensor.Reading,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: sensor.ReadingUnits,
              type: fanType,
              memberId: sensor.MemberId,
            });
          }
        );
        Temperatures.forEach(
          (sensor: {
            Name: any;
            Status: { Health: any };
            ReadingCelsius: any;
            LowerThresholdNonCritical: any;
            UpperThresholdNonCritical: any;
            LowerThresholdCritical: any;
            UpperThresholdCritical: any;
            MemberId: any;
          }) => {
            sensorData.push({
              name: sensor.Name,
              status: sensor.Status.Health,
              currentValue: sensor.ReadingCelsius,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: '℃',
              type: 'temperature',
              memberId: sensor.MemberId,
            });
          }
        );
        commit('setSensors', sensorData);
      })
      .catch((error) => console.log(error));
  },
  async getPowerSensors(
    { commit }: ActionContext<ActionNames, Multations, State, Getters>,
    id: any
  ) {
    return await api
      .get(`${id}/Power`)
      .then(({ data: { Voltages = [] } }) => {
        const sensorData = Voltages.map(
          (sensor: {
            Name: any;
            Status: { Health: any };
            ReadingVolts: any;
            LowerThresholdNonCritical: any;
            UpperThresholdNonCritical: any;
            LowerThresholdCritical: any;
            UpperThresholdCritical: any;
            MemberId: any;
          }) => {
            return {
              name: sensor.Name,
              status: sensor.Status.Health,
              currentValue: sensor.ReadingVolts,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: 'V',
              type: 'voltage',
              memberId: sensor.MemberId,
            };
          }
        );
        commit('setSensors', sensorData);
      })
      .catch((error) => console.log(error));
  },
};

const SensorsStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default SensorsStore;
