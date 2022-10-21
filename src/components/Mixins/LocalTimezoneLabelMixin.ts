import { format, OptionsWithTZ } from 'date-fns-tz';

const LocalTimezoneLabelMixin = {
  methods: {
    localOffset() {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const shortTz = this.$options.filters.shortTimeZone(new Date());
      const pattern = `'${shortTz}' O`;
      return format(new Date(), pattern, { timezone } as OptionsWithTZ).replace(
        'GMT',
        'UTC'
      );
    },
  },
};

export default LocalTimezoneLabelMixin;
