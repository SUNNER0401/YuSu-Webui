import store from '@/store';
import AlarmSettingStore from '@/store/modules/Settings/AlarmSettingStore';
import FanSpeedStore from '@/store/modules/Operations/FanSpeedStore';
import OperatingLogsStore from '@/store/modules/Logs/OperatingLogsStore';

store.registerModule('alarmSetting', AlarmSettingStore);
store.registerModule('fanSpeed', FanSpeedStore);
store.registerModule('operatingLogs', OperatingLogsStore);
export default store;
