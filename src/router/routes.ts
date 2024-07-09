import AppLayout from '@/layouts/AppLayout.vue';
import ChangePassword from '@/views/ChangePassword/ChangePassword.vue';
import ConsoleLayout from '@/layouts/ConsoleLayout.vue';
import DateTime from '@/views/Settings/DateTime/DateTime.vue';
import EventLogs from '@/views/Diagnostic/EventLogs/EventLogs.vue';
import Multimachine from '@/views/Multimachine/Multimachine.vue';
import MachineDetails from '@/views/MachineDetails/MachineDetails.vue';
import FactoryReset from '@/views/Services/FactoryReset/FactoryReset.vue';
import Firmware from '@/views/Settings/Firmware/Firmware.vue';
import Inventory from '@/views/SystemManagement/Inventory/Inventory.vue';
import Kvm from '@/views/Services/Kvm/Kvm.vue';
import KvmConsole from '@/views/Services/Kvm/KvmConsole.vue';
import Sessions from '../views/UserSecurity/Sessions/Sessions.vue';
import Ldap from '@/views/UserSecurity/Ldap/Ldap.vue';
// import UserManagement from '@/views/SecurityAndAccess/UserManagement.vue';
import UserManagement from '@/views/UserSecurity/UserManagement/UserManagement.vue';
import Login from '@/views/Login/Login.vue';
import LoginLayout from '@/layouts/LoginLayout.vue';
import Network from '@/views/Settings/Network/Network.vue';
import Overview from '@/views/Overview/Overview.vue';
import PageNotFound from '@/views/PageNotFound/PageNotFound.vue';
import PostCodeLogs from '@/views/Diagnostic/PostCodeLogs/PostCodeLogs.vue';
import PowerRestorePolicy from '@/views/Settings/PowerRestorePolicy/PowerRestorePolicy.vue';
import ProfileSettings from '@/views/ProfileSettings/ProfileSettings.vue';
import RebootBmc from '@/views/Settings/RebootBmc/RebootBmc.vue';
import Policies from '@/views/UserSecurity/Policies/Policies.vue';
import Sensors from '@/views/SystemManagement/Sensors/Sensors.vue';
import SerialOverLan from '@/views/Services/SerialOverLan/SerialOverLan.vue';
import SerialOverLanConsole from '@/views/Services/SerialOverLan/SerialOverLanConsole.vue';
import ServerPowerOperations from '@/views/Settings/ServerPowerOperations';
import Certificates from '@/views/UserSecurity/Certificates/Certificates.vue';
import VirtualMedia from '@/views/Services/VirtualMedia/VirtualMedia.vue';
import Power from '@/views/SystemManagement/Power/Power.vue';
import i18n from '@/i18n';

const routes = [
  {
    path: '/login',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: Login,
        meta: {
          title: i18n.t('appPageTitle.login'),
        },
      },
      {
        path: '/change-password',
        name: 'change-password',
        component: ChangePassword,
        meta: {
          title: i18n.t('appPageTitle.changePassword'),
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/console',
    component: ConsoleLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'serial-over-lan-console',
        name: 'serial-over-lan-console',
        component: SerialOverLanConsole,
        meta: {
          title: i18n.t('appPageTitle.serialOverLan'),
        },
      },
      {
        path: 'kvm',
        name: 'kvm-console',
        component: KvmConsole,
        meta: {
          title: i18n.t('appPageTitle.kvm'),
        },
      },
    ],
  },
  {
    path: '/',
    meta: {
      // requiresAuth: true,
    },
    component: AppLayout,
    children: [
      {
        path: '/multimachine',
        name: 'multimachine',
        component: Multimachine,
        meta: {
          title: i18n.t('appPageTitle.multimachine'),
        },
      },
      {
        path: '/machinedetails',
        name: 'machinedetails',
        component: MachineDetails,
        meta: {
          title: i18n.t('appPageTitle.machinedetails'),
        },
      },
      {
        path: '',
        name: 'overview',
        component: Overview,
        meta: {
          title: i18n.t('appPageTitle.overview'),
        },
      },
      {
        path: '/profile-settings',
        name: 'profile-settings',
        component: ProfileSettings,
        meta: {
          title: i18n.t('appPageTitle.profileSettings'),
        },
      },
      {
        path: '/logs/event-logs',
        name: 'event-logs',
        component: EventLogs,
        meta: {
          title: i18n.t('appPageTitle.eventLogs'),
        },
      },
      {
        path: '/logs/post-code-logs',
        name: 'post-code-logs',
        component: PostCodeLogs,
        meta: {
          title: i18n.t('appPageTitle.postCodeLogs'),
        },
      },
      {
        path: '/hardware-status/inventory',
        name: 'inventory',
        component: Inventory,
        meta: {
          title: i18n.t('appPageTitle.inventory'),
        },
      },
      {
        path: '/hardware-status/sensors',
        name: 'sensors',
        component: Sensors,
        meta: {
          title: i18n.t('appPageTitle.sensors'),
        },
      },
      {
        path: '/security-and-access/sessions',
        name: 'sessions',
        component: Sessions,
        meta: {
          title: i18n.t('appPageTitle.sessions'),
        },
      },
      {
        path: '/security-and-access/ldap',
        name: 'ldap',
        component: Ldap,
        meta: {
          title: i18n.t('appPageTitle.ldap'),
        },
      },
      {
        path: '/security-and-access/user-management',
        name: 'local-users',
        component: UserManagement,
        meta: {
          title: i18n.t('appPageTitle.userManagement'),
        },
      },
      {
        path: '/security-and-access/policies',
        name: 'policies',
        component: Policies,
        meta: {
          title: i18n.t('appPageTitle.policies'),
        },
      },
      {
        path: '/security-and-access/certificates',
        name: 'certificates',
        component: Certificates,
        meta: {
          title: i18n.t('appPageTitle.certificates'),
        },
      },
      {
        path: '/settings/date-time',
        name: 'date-time',
        component: DateTime,
        meta: {
          title: i18n.t('appPageTitle.dateTime'),
        },
      },
      {
        path: '/operations/factory-reset',
        name: 'factory-reset',
        component: FactoryReset,
        meta: {
          title: i18n.t('appPageTitle.factoryReset'),
        },
      },
      {
        path: '/operations/kvm',
        name: 'kvm',
        component: Kvm,
        meta: {
          title: i18n.t('appPageTitle.kvm'),
        },
      },
      {
        path: '/settings/firmware',
        name: 'firmware',
        component: Firmware,
        meta: {
          title: i18n.t('appPageTitle.firmware'),
        },
      },
      {
        path: '/settings/network',
        name: 'network',
        component: Network,
        meta: {
          title: i18n.t('appPageTitle.network'),
        },
      },
      {
        path: '/settings/power-restore-policy',
        name: 'power-restore-policy',
        component: PowerRestorePolicy,
        meta: {
          title: i18n.t('appPageTitle.powerRestorePolicy'),
        },
      },
      {
        path: '/resource-management/power',
        name: 'power',
        component: Power,
        meta: {
          title: i18n.t('appPageTitle.power'),
        },
      },
      {
        path: '/operations/reboot-bmc',
        name: 'reboot-bmc',
        component: RebootBmc,
        meta: {
          title: i18n.t('appPageTitle.rebootBmc'),
        },
      },
      {
        path: '/operations/serial-over-lan',
        name: 'serial-over-lan',
        component: SerialOverLan,
        meta: {
          title: i18n.t('appPageTitle.serialOverLan'),
        },
      },
      {
        path: '/operations/server-power-operations',
        name: 'server-power-operations',
        component: ServerPowerOperations,
        meta: {
          title: i18n.t('appPageTitle.serverPowerOperations'),
        },
      },
      {
        path: '/operations/virtual-media',
        name: 'virtual-media',
        component: VirtualMedia,
        meta: {
          title: i18n.t('appPageTitle.virtualMedia'),
        },
      },
      {
        path: '*',
        name: 'page-not-found',
        component: PageNotFound,
        meta: {
          title: i18n.t('appPageTitle.pageNotFound'),
        },
      },
    ],
  },
];

export default routes;
