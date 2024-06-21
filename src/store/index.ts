import Vue from 'vue';
import Vuex from 'vuex';

import GlobalStore from './modules/GlobalStore';
import AuthenticationStore from './modules/Authentication/AuthenticanStore';
import SessionsStore from './modules/UserSecurity/Sessions/SessionsStore';
import LdapStore from './modules/UserSecurity/LDAP/LdapStore';
import UserManagementStore from './modules/UserSecurity/UserManagement/UserManagementStore';
import CertificatesStore from './modules/UserSecurity/Certificates/CertificatesStore';
import FirmwareStore from './modules/Settings/FirmwareStore';
import BootSettingsStore from './modules/Settings/BootSettingsStore';
import ControlStore from './modules/Settings/ControlStore';
import PowerPolicyStore from './modules/Settings/PowerPolicyStore';
import NetworkStore from './modules/Settings/NetworkStore';
import EventLogStore from './modules/Diagnostic/EventLogs/EventLogStore';

import ServerLedStore from './modules/SystemManagement/SystemInformation/ServerLedStore';
import SystemStore from './modules/SystemManagement/SystemInformation/SystemStore';
import PowerSupplyStore from './modules/SystemManagement/SystemInformation/PowerSupplyStore';
import MemoryStore from './modules/SystemManagement/SystemInformation/MemoryStore';
import FanStore from './modules/SystemManagement/SystemInformation/FanStore';
import ChassisStore from './modules/SystemManagement/SystemInformation/ChassisStore';
import BmcStore from './modules/SystemManagement/SystemInformation/BmcStore';
import ProcessorStore from './modules/SystemManagement/SystemInformation/ProcessorStore';
import AssemblyStore from './modules/SystemManagement/SystemInformation/AssemblyStore';
import FanControlStore from './modules/SystemManagement/SystemInformation/FanControlStore';
import PowerManageStore from './modules/SystemManagement/SystemInformation/PowerManage';
import PoliciesStore from './modules/UserSecurity/Policies/PoliciesStore';
import FactoryResetStore from './modules/ServicesManagement/FactoryReset/FactoryResetStore';

import WebSocketPlugin from './plugins/WebSocketPlugin';
import DateTimeStore from './modules/Settings/DateTimeStore';
import VirtualMediaStore from './modules/ServicesManagement/VirtualMedia/VirtualMediaStore';

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
  powerPolicy: PowerPolicyStore,
  powerSupply: PowerSupplyStore,
  network: NetworkStore,
  eventLog: EventLogStore,
  serverLed: ServerLedStore,
  certificates: CertificatesStore,
  system: SystemStore,
  memory: MemoryStore,
  fan: FanStore,
  chassis: ChassisStore,
  bmc: BmcStore,
  processors: ProcessorStore,
  assemblies: AssemblyStore,
  virtualMedia: VirtualMediaStore,
  policies: PoliciesStore,
  fanControl: FanControlStore,
  powerManage: PowerManageStore,
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
