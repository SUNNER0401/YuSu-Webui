const STATUS = ['OK', 'Warning', 'Critical'];

const TableSortMixin = {
  methods: {
    sortStatus(
      a: { [x: string]: string },
      b: { [x: string]: string },
      key: string | number
    ) {
      return STATUS.indexOf(a[key]) - STATUS.indexOf(b[key]);
    },
  },
};

export default TableSortMixin;
