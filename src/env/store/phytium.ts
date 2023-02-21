import store from '@/store';
import AlarmSettingStore from '@/store/modules/Settings/AlarmSettingStore';
import FanSpeedStore from '@/store/modules/Operations/FanSpeedStore';
import OperatingLogsStore from '@/store/modules/Logs/OperatingLogsStore';
import PcieStore from '@/store/modules/HardwareStatus/PcieStore';
import ConfugureManagementStore from '@/store/modules/ResourceManagement/ConfigureManagement';

store.registerModule('alarmSetting', AlarmSettingStore);
store.registerModule('fanSpeed', FanSpeedStore);
store.registerModule('operatingLogs', OperatingLogsStore);
store.registerModule('pcie', PcieStore);
store.registerModule('configure', ConfugureManagementStore);
export default store;
