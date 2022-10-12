import i18n from '@/i18n';

// Import layouts quickly.
const layouts = {};
const context1 = require.context('@/layouts', true, /\.vue$/);
context1.keys().forEach((key) => {
  let filename = key.split('/')[key.split('/').length - 1];
  let viewName = filename.replace('.vue', '');
  layouts[viewName] = context1(key).default;
});
// Import views quickly.
const views = {};
const context2 = require.context('@/views', true, /\.vue$/);
context2.keys().forEach((key) => {
  let filename = key.split('/')[key.split('/').length - 1];
  let viewName = filename.replace('.vue', '');
  views[viewName] = context2(key).default;
});

export var setRoutes = () => {
  return [
    {
      path: '/login',
      component: layouts.LoginLayout,
      children: [
        {
          path: '',
          name: 'login',
          component: views.Login,
          meta: {
            title: i18n.t('appPageTitle.login'),
          },
        },
        {
          path: '/change-password',
          name: 'change-password',
          component: views.ChangePassword,
          meta: {
            title: i18n.t('appPageTitle.changePassword'),
            requiresAuth: true,
          },
        },
      ],
    },
    {
      path: '/console',
      component: layouts.ConsoleLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'serial-over-lan-console',
          name: 'serial-over-lan-console',
          component: views.SerialOverLanConsole,
          meta: {
            title: i18n.t('appPageTitle.serialOverLan'),
          },
        },
        {
          path: 'kvm',
          name: 'kvm-console',
          component: views.KvmConsole,
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
      component: layouts.AppLayout,
      children: [
        {
          path: '',
          name: 'overview',
          component: views.Overview,
          meta: {
            // title: i18n.t('appPageTitle.overview'),
            title: i18n.t('appPageTitle.overview'),
          },
        },
        {
          path: '/profile-settings',
          name: 'profile-settings',
          component: views.ProfileSettings,
          meta: {
            title: i18n.t('appPageTitle.profileSettings'),
          },
        },
        {
          path: '/logs/event-logs',
          name: 'event-logs',
          component: views.EventLogs,
          meta: {
            title: i18n.t('appPageTitle.eventLogs'),
          },
        },
        {
          path: '/logs/post-code-logs',
          name: 'post-code-logs',
          component: views.PostCodeLogs,
          meta: {
            title: i18n.t('appPageTitle.postCodeLogs'),
          },
        },
        {
          path: '/logs/operating-logs',
          name: 'operating-logs',
          component: views.OperatingLogs,
          meta: {
            title: i18n.t('appPageTitle.operatingLogs'),
          },
        },
        {
          path: '/hardware-status/inventory',
          name: 'inventory',
          component: views.Inventory,
          meta: {
            title: i18n.t('appPageTitle.inventory'),
          },
        },
        {
          path: '/hardware-status/sensors',
          name: 'sensors',
          component: views.Sensors,
          meta: {
            title: i18n.t('appPageTitle.sensors'),
          },
        },
        {
          path: '/security-and-access/sessions',
          name: 'sessions',
          component: views.Sessions,
          meta: {
            title: i18n.t('appPageTitle.sessions'),
          },
        },
        {
          path: '/security-and-access/ldap',
          name: 'ldap',
          component: views.Ldap,
          meta: {
            title: i18n.t('appPageTitle.ldap'),
          },
        },
        {
          path: '/security-and-access/user-management',
          name: 'local-users',
          component: views.UserManagement,
          meta: {
            title: i18n.t('appPageTitle.userManagement'),
          },
        },
        {
          path: '/security-and-access/policies',
          name: 'policies',
          component: views.Policies,
          meta: {
            title: i18n.t('appPageTitle.policies'),
          },
        },
        {
          path: '/security-and-access/certificates',
          name: 'certificates',
          component: views.Certificates,
          meta: {
            title: i18n.t('appPageTitle.certificates'),
          },
        },
        {
          path: '/settings/date-time',
          name: 'date-time',
          component: views.DateTime,
          meta: {
            title: i18n.t('appPageTitle.dateTime'),
          },
        },
        {
          path: '/operations/factory-reset',
          name: 'factory-reset',
          component: views.FactoryReset,
          meta: {
            title: i18n.t('appPageTitle.factoryReset'),
          },
        },
        {
          path: '/operations/fan-speed',
          name: 'fan-speed',
          component: views.FanSpeed,
          meta: {
            title: i18n.t('appPageTitle.fanSpeed'),
          },
        },
        {
          path: '/operations/kvm',
          name: 'kvm',
          component: views.Kvm,
          meta: {
            title: i18n.t('appPageTitle.kvm'),
          },
        },
        {
          path: '/operations/firmware',
          name: 'firmware',
          component: views.Firmware,
          meta: {
            title: i18n.t('appPageTitle.firmware'),
          },
        },
        {
          path: '/settings/network',
          name: 'network',
          component: views.Network,
          meta: {
            title: i18n.t('appPageTitle.network'),
          },
        },
        {
          path: '/settings/power-restore-policy',
          name: 'power-restore-policy',
          component: views.PowerRestorePolicy,
          meta: {
            title: i18n.t('appPageTitle.powerRestorePolicy'),
          },
        },
        {
          path: '/settings/alarm-setting',
          name: 'alarm-setting',
          component: views.AlarmSetting,
          meta: {
            title: i18n.t('appPageTitle.alarmSetting'),
          },
        },
        {
          path: '/resource-management/power',
          name: 'power',
          component: views.Power,
          meta: {
            title: i18n.t('appPageTitle.power'),
          },
        },
        {
          path: '/operations/reboot-bmc',
          name: 'reboot-bmc',
          component: views.RebootBmc,
          meta: {
            title: i18n.t('appPageTitle.rebootBmc'),
          },
        },
        {
          path: '/operations/serial-over-lan',
          name: 'serial-over-lan',
          component: views.SerialOverLan,
          meta: {
            title: i18n.t('appPageTitle.serialOverLan'),
          },
        },
        {
          path: '/operations/server-power-operations',
          name: 'server-power-operations',
          component: views.ServerPowerOperations,
          meta: {
            title: i18n.t('appPageTitle.serverPowerOperations'),
          },
        },
        {
          path: '/operations/virtual-media',
          name: 'virtual-media',
          component: views.VirtualMedia,
          meta: {
            title: i18n.t('appPageTitle.virtualMedia'),
          },
        },
        {
          path: '/about/about-us',
          name: 'about-us',
          component: views.AboutUs,
          meta: {
            title: '关于我们',
          },
        },
        {
          path: '*',
          name: 'page-not-found',
          component: views.PageNotFound,
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
