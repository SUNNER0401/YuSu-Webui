import Vue from 'vue';
import App from './App.vue';
import router from './router';
//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import store from './store';

import './icons'; // icon

import {
  AlertPlugin,
  BadgePlugin,
  ButtonPlugin,
  ButtonGroupPlugin,
  BVConfigPlugin,
  CardPlugin,
  CollapsePlugin,
  DropdownPlugin,
  FormPlugin,
  FormCheckboxPlugin,
  FormDatepickerPlugin,
  FormFilePlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormRadioPlugin,
  FormSelectPlugin,
  FormSpinbuttonPlugin,
  FormTagsPlugin,
  InputGroupPlugin,
  LayoutPlugin,
  LinkPlugin,
  ListGroupPlugin,
  ModalPlugin,
  NavbarPlugin,
  NavPlugin,
  PaginationPlugin,
  ProgressPlugin,
  SpinnerPlugin,
  TablePlugin,
  TabsPlugin,
  ToastPlugin,
  TooltipPlugin,
  IconsPlugin,
} from 'bootstrap-vue';
import Vuelidate from 'vuelidate';
import i18n from './i18n';
import { format, OptionsWithTZ } from 'date-fns-tz';
import { ThisTypedComponentOptionsWithArrayProps } from 'vue/types/options';
import _ from 'lodash';

// Filters
Vue.filter('shortTimeZone', function (value: any) {
  const longTZ = value
    .toString()
    .match(/\((.*)\)/)
    .pop();
  const regexNotUpper = /[*a-z ]/g;
  return longTZ.replace(regexNotUpper, '');
});

Vue.filter('formatDate', function (value: any) {
  const isUtcDisplay = store.getters['global/isUtcDisplay'];

  if (value instanceof Date) {
    if (isUtcDisplay) {
      return value.toISOString().substring(0, 10);
    }
    const pattern = `yyyy-MM-dd`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = <OptionsWithTZ>{
      timezone,
    };
    return format(value, pattern, options);
  }
});

Vue.filter('formatTime', function (value: any) {
  const isUtcDisplay = store.getters['global/isUtcDisplay'];

  if (value instanceof Date) {
    if (isUtcDisplay) {
      let timeOptions = {
        timeZone: 'UTC',
        hourCycle: 'h23',
      };
      return `${value.toLocaleTimeString('default', <any>timeOptions)} UTC`;
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = <OptionsWithTZ>{
      timezone,
    };
    const shortTz = Vue.filter('shortTimeZone')(value);
    const pattern = `HH:mm:ss ('${shortTz}' O)`;
    return format(value, pattern, options).replace('GMT', 'UTC');
  }
});

// Plugins
Vue.use(AlertPlugin);
Vue.use(BadgePlugin);
Vue.use(ButtonPlugin);
Vue.use(ButtonGroupPlugin);
Vue.use(BVConfigPlugin, {
  BFormText: { textVariant: 'secondary' },
  BTable: {
    headVariant: 'light',
    footVariant: 'light',
  },
  BFormTags: {
    tagVariant: 'primary',
    addButtonVariant: 'link-primary',
  },
  BBadge: {
    variant: 'primary',
  },
});
Vue.use(CardPlugin);
Vue.use(CollapsePlugin);
Vue.use(DropdownPlugin);
Vue.use(FormPlugin);
Vue.use(FormCheckboxPlugin);
Vue.use(FormDatepickerPlugin);
Vue.use(FormFilePlugin);
Vue.use(FormGroupPlugin);
Vue.use(FormInputPlugin);
Vue.use(FormRadioPlugin);
Vue.use(FormSelectPlugin);
Vue.use(FormSpinbuttonPlugin);
Vue.use(FormTagsPlugin);
Vue.use(InputGroupPlugin);
Vue.use(LayoutPlugin);
Vue.use(LayoutPlugin);
Vue.use(LinkPlugin);
Vue.use(ListGroupPlugin);
Vue.use(ModalPlugin);
Vue.use(NavbarPlugin);
Vue.use(NavPlugin);
Vue.use(PaginationPlugin);
Vue.use(ProgressPlugin);
Vue.use(SpinnerPlugin);
Vue.use(TablePlugin);
Vue.use(TabsPlugin);
Vue.use(ToastPlugin);
Vue.use(TooltipPlugin);
Vue.use(IconsPlugin);
Vue.use(Vuelidate);

Vue.prototype._ = _;

const vueOptions = <
  ThisTypedComponentOptionsWithArrayProps<
    Vue,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    never
  >
>{
  i18n,
  router,
  store,
  render: (h) => h(App),
};
new Vue(vueOptions).$mount('#app');
