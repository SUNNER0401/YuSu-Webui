import i18n from '@/i18n';
import TableSystem from '@/views/SystemManagement/Inventory/InventoryTableSystem';
import TablePowerSupplies from '@/views/SystemManagement/Inventory/InventoryTablePowerSupplies';
import TableDimmSlot from '@/views/SystemManagement/Inventory/InventoryTableDimmSlot';
import TableFans from '@/views/SystemManagement/Inventory/InventoryTableFans';
import TableBmcManager from '@/views/SystemManagement/Inventory/InventoryTableBmcManager';
import TableChassis from '@/views/SystemManagement/Inventory/InventoryTableChassis';
import TableProcessors from '@/views/SystemManagement/Inventory/InventoryTableProcessors';
import TablePci from '@/views/SystemManagement/Inventory/InventoryTablePci';

const roles = {
  administrator: 'Administrator',
  operator: 'Operator',
  readonly: 'ReadOnly',
  noaccess: 'NoAccess',
};

export let setRoutes = () => {
  return [
    {
      path: '/login',
      component: () => import('@/layouts/LoginLayout'),
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/Login'),
          meta: {
            title: i18n.t('appPageTitle.login'),
          },
        },
        {
          path: '/change-password',
          name: 'change-password',
          component: () => import('@/views/ChangePassword'),
          meta: {
            title: i18n.t('appPageTitle.changePassword'),
            requiresAuth: true,
          },
        },
      ],
    },
    {
      path: '/console',
      component: () => import('@/layouts/ConsoleLayout'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'serial-over-lan-console',
          name: 'serial-over-lan-console',
          component: () =>
            import('@/views/Services/SerialOverLan/SerialOverLanConsole'),
          meta: {
            title: i18n.t('appPageTitle.serialOverLan'),
          },
        },
        {
          path: 'kvm',
          name: 'kvm-console',
          component: () => import('@/views/Services/Kvm/KvmConsole.vue'),
          meta: {
            title: i18n.t('appPageTitle.kvm'),
          },
        },
      ],
    },
    {
      path: '/',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/layouts/AppLayout'),
      children: [
        {
          path: '',
          name: 'overview',
          component: () => import('@/views/Overview'),
          meta: {
            title: i18n.t('appPageTitle.overview'),
          },
        },
        {
          path: '/chassis-management',
          name: 'chassisManagement',
          component: () => import('@/views/ChassisManagement'),
          meta: {
            title: i18n.t('appPageTitle.chassisManagement'),
          },
        },
        {
          path: '/profile-settings',
          name: 'profile-settings',
          component: () => import('@/views/ProfileSettings'),
          meta: {
            title: i18n.t('appPageTitle.profileSettings'),
          },
        },
        {
          path: '/system-management/system-information',
          name: 'system-information',
          component: () => import('@/views/SystemManagement/Inventory'),
          meta: {
            title: i18n.t('appPageTitle.inventory'),
          },
          children: [
            {
              path: '',
              redirect: 'system',
            },
            {
              path: 'system',
              component: TableSystem,
            },
            {
              path: 'powerSupplies',
              component: TablePowerSupplies,
            },
            {
              path: 'dimmSlot',
              component: TableDimmSlot,
            },
            {
              path: 'fans',
              component: TableFans,
            },
            {
              path: 'bmcManager',
              component: TableBmcManager,
            },
            {
              path: 'chassis',
              component: TableChassis,
            },
            {
              path: 'processors',
              component: TableProcessors,
            },
            {
              path: 'pci',
              component: TablePci,
            },
          ],
        },
        {
          path: '/system-management/performance-monitor',
          name: 'performanceMonitor',
          component: () =>
            import('@/views/SystemManagement/PerformanceMonitor'),
          meta: {
            title: i18n.t('appPageTitle.performanceMonitor'),
          },
        },
        {
          path: '/system-management/power',
          name: 'power',
          component: () => import('@/views/SystemManagement/Power'),
          meta: {
            title: i18n.t('appPageTitle.power'),
          },
        },
        {
          path: '/system-management/fan-speed',
          name: 'fan-speed',
          component: () => import('@/views/SystemManagement/FanSpeed'),
          meta: {
            title: i18n.t('appPageTitle.fanSpeed'),
          },
        },
        {
          path: '/system-management/sensors',
          name: 'sensors',
          component: () => import('@/views/SystemManagement/Sensors'),
          meta: {
            title: i18n.t('appPageTitle.sensors'),
          },
        },
        {
          path: '/system-management/fan',
          name: 'fan',
          component: () => import('@/views/SystemManagement/Fan'),
          meta: {
            title: i18n.t('appPageTitle.fanSpeed'),
          },
        },
        {
          path: '/system-management/power-manage',
          name: 'power-manage',
          component: () => import('@/views/SystemManagement/PowerManage'),
          meta: {
            title: i18n.t('appPageTitle.PowerManage'),
          },
        },
        {
          path: '/diagnostic/event-logs',
          name: 'event-logs',
          component: () => import('@/views/Diagnostic/EventLogs'),
          meta: {
            title: i18n.t('appPageTitle.eventLogs'),
          },
        },
        {
          path: '/diagnostic/post-code-logs',
          name: 'post-code-logs',
          component: () => import('@/views/Diagnostic/PostCodeLogs'),
          meta: {
            title: i18n.t('appPageTitle.postCodeLogs'),
          },
        },
        {
          path: '/diagnostic/operating-logs',
          name: 'operating-logs',
          component: () => import('@/views/Diagnostic/OperatingLogs'),
          meta: {
            title: i18n.t('appPageTitle.operatingLogs'),
          },
        },
        {
          path: '/diagnostic/ras-logs',
          name: 'ras-logs',
          component: () => import('@/views/Diagnostic/RasLogs'),
          meta: {
            title: i18n.t('appPageTitle.rasLogs'),
          },
        },
        {
          path: '/user-security/sessions',
          name: 'sessions',
          component: () => import('@/views/UserSecurity/Sessions'),
          meta: {
            title: i18n.t('appPageTitle.sessions'),
          },
        },
        {
          path: '/user-security/ldap',
          name: 'ldap',
          component: () => import('@/views/UserSecurity/Ldap'),
          meta: {
            title: i18n.t('appPageTitle.ldap'),
          },
        },
        {
          path: '/user-security/user-management',
          name: 'local-users',
          component: () => import('@/views/UserSecurity/UserManagement'),
          meta: {
            title: i18n.t('appPageTitle.userManagement'),
          },
        },
        {
          path: '/user-security/certificates',
          name: 'certificates',
          component: () => import('@/views/UserSecurity/Certificates'),
          meta: {
            title: i18n.t('appPageTitle.certificates'),
          },
        },
        {
          path: '/user-security/policies',
          name: 'policies',
          component: () => import('@/views/UserSecurity/Policies'),
          meta: {
            title: i18n.t('appPageTitle.policies'),
          },
        },
        {
          path: '/services/factory-reset',
          name: 'factory-reset',
          component: () => import('@/views/Services/FactoryReset'),
          meta: {
            title: i18n.t('appPageTitle.factoryReset'),
          },
        },
        {
          path: '/services/kvm',
          name: 'kvm',
          component: () => import('@/views/Services/Kvm'),
          meta: {
            title: i18n.t('appPageTitle.kvm'),
            exclusiveToRoles: [roles.administrator],
          },
        },
        {
          path: '/services/serial-over-lan',
          name: 'serial-over-lan',
          component: () => import('@/views/Services/SerialOverLan'),
          meta: {
            title: i18n.t('appPageTitle.serialOverLan'),
            exclusiveToRoles: [roles.administrator],
          },
        },
        {
          path: '/services/alarm-setting',
          name: 'alarm-setting',
          component: () => import('@/views/Services/AlarmSetting'),
          meta: {
            title: i18n.t('appPageTitle.alarmSetting'),
          },
        },
        {
          path: '/services/virtual-media',
          name: 'virtual-media',
          component: () => import('@/views/Services/VirtualMedia'),
          meta: {
            title: i18n.t('appPageTitle.virtualMedia'),
          },
        },
        {
          path: '/settings/network',
          name: 'network',
          component: () => import('@/views/Settings/Network'),
          meta: {
            title: i18n.t('appPageTitle.network'),
          },
        },
        {
          path: '/settings/firmware',
          name: 'firmware',
          component: () => import('@/views/Settings/Firmware'),
          meta: {
            title: i18n.t('appPageTitle.firmware'),
          },
        },
        {
          path: '/settings/configure-management',
          name: 'configureManagement',
          component: () => import('@/views/Settings/ConfigureManagement'),
          meta: {
            title: i18n.t('appPageTitle.configureManagement'),
          },
        },
        {
          path: '/settings/date-time',
          name: 'date-time',
          component: () => import('@/views/Settings/DateTime'),
          meta: {
            title: i18n.t('appPageTitle.dateTime'),
          },
        },
        {
          path: '/settings/server-power-operations',
          name: 'server-power-operations',
          component: () => import('@/views/Settings/ServerPowerOperations'),
          meta: {
            title: i18n.t('appPageTitle.serverPowerOperations'),
          },
        },
        {
          path: '/settings/reboot-bmc',
          name: 'reboot-bmc',
          component: () => import('@/views/Settings/RebootBmc'),
          meta: {
            title: i18n.t('appPageTitle.rebootBmc'),
          },
        },
        {
          path: '/settings/power-restore-policy',
          name: 'power-restore-policy',
          component: () => import('@/views/Settings/PowerRestorePolicy'),
          meta: {
            title: i18n.t('appPageTitle.powerRestorePolicy'),
          },
        },
        {
          path: '*',
          name: 'page-not-found',
          component: () => import('@/views/PageNotFound'),
          meta: {
            title: i18n.t('appPageTitle.pageNotFound'),
          },
        },
      ],
    },
  ];
};

const routes = setRoutes();

export default routes;
