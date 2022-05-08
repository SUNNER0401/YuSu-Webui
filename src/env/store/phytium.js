import store from '@/store';
import AlarmSettingStore from '@/store/modules/Settings/AlarmSettingStore';
import FanSpeedStore from '@/store/modules/Operations/FanSpeedStore';

store.registerModule('alarmSetting', AlarmSettingStore);
store.registerModule('fanSpeed', FanSpeedStore);
export default store;
