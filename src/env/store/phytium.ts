// import store from '@/store';
const store = require('@/store').default;
// import AlarmSettingStore from '@/store/modules/Settings/AlarmSettingStore';
const AlarmSettingStore = require('@/store/modules/Settings/AlarmSettingStore')
  .default;
// import FanSpeedStore from '@/store/modules/Operations/FanSpeedStore';
const FanSpeedStore = require('@/store/modules/Operations/FanSpeedStore')
  .default;
// import OperatingLogsStore from '@/store/modules/Logs/OperatingLogsStore';
const OperatingLogsStore = require('@/store/modules/Logs/OperatingLogsStore')
  .default;

store.registerModule('alarmSetting', AlarmSettingStore);
store.registerModule('fanSpeed', FanSpeedStore);
store.registerModule('operatingLogs', OperatingLogsStore);
export default store;
