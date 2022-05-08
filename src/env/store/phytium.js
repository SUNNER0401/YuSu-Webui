import store from '@/store';
import FanSpeedStore from '@/store/modules/Operations/FanSpeedStore';

store.registerModule('fanSpeed', FanSpeedStore);
export default store;
