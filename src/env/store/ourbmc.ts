import store from '@/store';
import AlarmSettingStore from '@/store/modules/Settings/AlarmSettingStore';
import FanSpeedStore from '@/store/modules/Operations/FanSpeedStore';
import OperatingLogsStore from '@/store/modules/Logs/OperatingLogsStore';
import PcieStore from '@/store/modules/HardwareStatus/PcieStore';
import ConfugureManagementStore from '@/store/modules/ResourceManagement/ConfigureManagement';
import RasLogsStore from '@/store/modules/Logs/RasLogsStore';
import PerformanceMonitorStore from '@/store/modules/HardwareStatus/PerformanceMonitorStore';

store.registerModule('alarmSetting', AlarmSettingStore);
store.registerModule('fanSpeed', FanSpeedStore);
store.registerModule('operatingLogs', OperatingLogsStore);
store.registerModule('pcie', PcieStore);
store.registerModule('configure', ConfugureManagementStore);
store.registerModule('rasLogs', RasLogsStore);
store.registerModule('performanceMonitor', PerformanceMonitorStore);
export default store;
