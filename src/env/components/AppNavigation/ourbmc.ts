import i18n from '@/i18n';

export const FatherName = {
  '/': i18n.t('appPageTitle.overview'),
  'system-management': i18n.t('appNavigation.systemManagement'),
  diagnostic: i18n.t('appNavigation.diagnostic'),
  'user-security': i18n.t('appNavigation.UserSecurity'),
  services: i18n.t('appNavigation.Services'),
  settings: i18n.t('appNavigation.settings'),
};

const roles = {
  administrator: 'Administrator',
  operator: 'Operator',
  readonly: 'ReadOnly',
  noaccess: 'NoAccess',
};

export default {
  '/': [
    {
      path: '/',
      name: 'overview',
      component: () => import('@/views/Overview'),
      meta: {
        title: i18n.t('appPageTitle.overview'),
      },
    },
  ],
  'system-management': [
    {
      path: '/system-management/system-information',
      name: 'system-information',
      component: () => import('@/views/SystemManagement/Inventory'),
      meta: {
        title: i18n.t('appPageTitle.inventory'),
      },
    },
    {
      path: '/system-management/performance-monitor',
      name: 'performanceMonitor',
      component: () => import('@/views/SystemManagement/PerformanceMonitor'),
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
  ],
  diagnostic: [
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
  ],
  'user-security': [
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
  ],
  services: [
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
  ],
  settings: [
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
  ],
};
