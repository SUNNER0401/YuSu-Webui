import api from '@/store/api';

const SensorsStore = {
  namespaced: true,
  state: {
    sensors: [],
  },
  getters: {
    sensors: (state: { sensors: any }) => state.sensors,
  },
  mutations: {
    setSensors: (state: { sensors: any[] }, sensors: any[]) => {
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
  },
  actions: {
    async getAllSensors({ dispatch }: any) {
      const collection = await dispatch('getChassisCollection');
      if (!collection) return;
      const promises = collection.reduce((acc: any[], id: any) => {
        acc.push(dispatch('getSensors', id));
        acc.push(dispatch('getThermalSensors', id));
        acc.push(dispatch('getPowerSensors', id));
        return acc;
      }, []);
      return await api.all(promises);
    },
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member: { [x: string]: any }) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getSensors({ commit }: any, id: any) {
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
              };
            }
          );
          commit('setSensors', sensorData);
        })
      );
    },
    async getThermalSensors({ commit }: any, id: any) {
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
            }) => {
              sensorData.push({
                name: sensor.Name,
                status: sensor.Status.Health,
                currentValue: sensor.Reading,
                lowerCaution: sensor.LowerThresholdNonCritical,
                upperCaution: sensor.UpperThresholdNonCritical,
                lowerCritical: sensor.LowerThresholdCritical,
                upperCritical: sensor.UpperThresholdCritical,
                units: sensor.ReadingUnits,
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
              });
            }
          );
          commit('setSensors', sensorData);
        })
        .catch((error) => console.log(error));
    },
    async getPowerSensors({ commit }: any, id: any) {
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
              };
            }
          );
          commit('setSensors', sensorData);
        })
        .catch((error) => console.log(error));
    },
  },
};

export default SensorsStore;
