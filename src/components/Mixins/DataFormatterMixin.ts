const DataFormatterMixin = {
  methods: {
    dataFormatter(value: string | number | null | undefined) {
      if (value === undefined || value === null || value === '') {
        return '--';
      } else if (typeof value === 'number') {
        return parseFloat(value.toFixed(3));
      } else {
        return value;
      }
    },
    statusIcon(status: string) {
      switch (status) {
        case 'OK':
          return 'success';
        case 'Warning':
          return 'warning';
        case 'Critical':
          return 'danger';
        default:
          return '';
      }
    },
    dataFormatterArray(value: any[]) {
      return value.join(', ');
    },
    unitFormatter(string: any) {
      switch (string) {
        case 'RPMS':
          return 'RPM';
        case 'Volts':
          return 'V';
        case 'Percent':
          return '%';
        case 'Watts':
          return 'W';
        default:
          return string;
      }
    },
  },
};

export default DataFormatterMixin;
