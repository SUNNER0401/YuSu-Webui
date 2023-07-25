import Vue from 'vue';
import Vuex from 'vuex';

import GlobalStore from './modules/GlobalStore';
import AuthenticationStore from './modules/Authentication/AuthenticanStore';
import SessionsStore from './modules/SecurityAndAccess/SessionsStore';
import LdapStore from './modules/SecurityAndAccess/LdapStore';
import UserManagementStore from './modules/SecurityAndAccess/UserManagementStore';
import CertificatesStore from './modules/SecurityAndAccess/CertificatesStore';
import FirmwareStore from './modules/Operations/FirmwareStore';
import BootSettingsStore from './modules/Operations/BootSettingsStore';
import ControlStore from './modules/Operations/ControlStore';
import PowerControlStore from './modules/ResourceManagement/PowerControlStore';
import PowerPolicyStore from './modules/Settings/PowerPolicyStore';
import NetworkStore from './modules/Settings/NetworkStore';
import EventLogStore from './modules/Logs/EventLogStore';
import SensorsStore from './modules/HardwareStatus/SensorsStore';
import ServerLedStore from './modules/HardwareStatus/ServerLedStore';
import SystemStore from './modules/HardwareStatus/SystemStore';
import PowerSupplyStore from './modules/HardwareStatus/PowerSupplyStore';
import MemoryStore from './modules/HardwareStatus/MemoryStore';
import FanStore from './modules/HardwareStatus/FanStore';
import ChassisStore from './modules/HardwareStatus/ChassisStore';
import BmcStore from './modules/HardwareStatus/BmcStore';
import ProcessorStore from './modules/HardwareStatus/ProcessorStore';
import AssemblyStore from './modules/HardwareStatus/AssemblyStore';
import PostCodeLogsStore from './modules/Logs/PostCodeLogsStore';
import PoliciesStore from './modules/SecurityAndAccess/PoliciesStore';
import FactoryResetStore from './modules/Operations/FactoryResetStore';

import WebSocketPlugin from './plugins/WebSocketPlugin';
import DateTimeStore from './modules/Settings/DateTimeStore';
import VirtualMediaStore from './modules/Operations/VirtualMediaStore';

Vue.use(Vuex);

type UnionToCross<T> = (T extends any ? (x: T) => void : never) extends (
  x: infer U
) => void
  ? U
  : never;
type Simplify<T> = { [P in keyof T]: T[P] };
type SubObjAll<T> = Simplify<UnionToCross<T[keyof T]>>;
const modules = {
  global: GlobalStore,
  authentication: AuthenticationStore,
  sessions: SessionsStore,
  dateTime: DateTimeStore,
  ldap: LdapStore,
  userManagement: UserManagementStore,
  firmware: FirmwareStore,
  serverBootSettings: BootSettingsStore,
  controls: ControlStore,
  powerControl: PowerControlStore,
  powerPolicy: PowerPolicyStore,
  powerSupply: PowerSupplyStore,
  network: NetworkStore,
  eventLog: EventLogStore,
  sensors: SensorsStore,
  serverLed: ServerLedStore,
  certificates: CertificatesStore,
  system: SystemStore,
  memory: MemoryStore,
  fan: FanStore,
  chassis: ChassisStore,
  bmc: BmcStore,
  processors: ProcessorStore,
  assemblies: AssemblyStore,
  postCodeLogs: PostCodeLogsStore,
  virtualMedia: VirtualMediaStore,
  policies: PoliciesStore,
  factoryReset: FactoryResetStore,
};

type modulesType = typeof modules;

type MergeFuncs<T extends keyof modulesType[keyof modulesType]> = SubObjAll<
  {
    [P1 in keyof modulesType]: {
      [P2 in keyof modulesType[P1][T] as `${P1}/${P2 &
        string}`]: modulesType[P1][T][P2];
    };
  }
>;

// 从 module 的 state 中提取 state 的类型并集合
type State = { [P in keyof modulesType]: modulesType[P]['state'] };
// 将 getter 函数转换成 {getterName: getterFuncsReturnType} 的对象类型
export type ReturnGetters<
  T extends { [key: string]: (...args: any) => any }
> = { [P in keyof T]: ReturnType<T[P]> };
// 提取所有 module 的 getter 函数类型对象
type GettersFuncs = MergeFuncs<'getters'>;
// 将 getter 转换成对象
type Getters = ReturnGetters<GettersFuncs>;

// 提取 mutation 函数类型
type CommitFuncs = MergeFuncs<'mutations'>;
// 将 mutation 函数名及 payload 类型转换成 commit 函数的两个入参类型
interface Commit {
  <T extends keyof CommitFuncs>(
    type: T,
    payload?: Parameters<CommitFuncs[T]>[1]
  ): void;
}

// dispatch 处理步骤同 commit
type DispatchFuncs = MergeFuncs<'actions'>;
interface Dispatch {
  <T extends keyof DispatchFuncs>(
    type: T,
    payload?: Parameters<DispatchFuncs[T]>[1]
  ): Promise<any>;
}

const store = new Vuex.Store({
  modules,
  plugins: [WebSocketPlugin],
});
export default store;

export const { state } = store;
export const { getters }: { getters: Getters } = store;
export const { commit }: { commit: Commit } = store;
export const { dispatch }: { dispatch: Dispatch } = store;

export interface Store {
  state: State;
  getters: Getters;
  commit: Commit;
  dispatch: Dispatch;
}
