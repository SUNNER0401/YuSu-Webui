import { includes } from 'lodash';

const TableFilterMixin = {
  methods: {
    getFilteredTableData(tableData: any[] = [], filters: any[] = []) {
      const filterItems = filters.reduce((arr, filter) => {
        return [...arr, ...filter.values];
      }, []);
      // If no filters are active, then return all table data
      if (filterItems.length === 0) return tableData;

      // Check if row property value is included in list of
      // active filters
      return tableData.filter((row) => {
        let returnRow = false;
        for (const { key, values } of filters) {
          const rowProperty = row[key];
          if (values.length === 0) continue;
          if (rowProperty && includes(values, rowProperty)) {
            returnRow = true;
          } else {
            returnRow = false;
            break;
          }
        }
        return returnRow;
      });
    },
    getFilteredTableDataByDate(
      tableData: any[] = [],
      startDate: { getTime: () => number; getTimezoneOffset: () => number },
      endDate: { getTime: () => number; getTimezoneOffset: () => number },
      propertyKey = 'date'
    ) {
      if (!startDate && !endDate) return tableData;
      let startDateInMs = startDate ? startDate.getTime() : 0;
      let endDateInMs = endDate ? endDate.getTime() : Number.POSITIVE_INFINITY;

      const isUtcDisplay = this.$store.getters['global/isUtcDisplay'];

      //Offset preference selected
      if (!isUtcDisplay) {
        startDateInMs = startDate
          ? startDate.getTime() + startDate.getTimezoneOffset() * 60000
          : 0;
        endDateInMs = endDate
          ? endDate.getTime() + endDate.getTimezoneOffset() * 60000
          : Number.POSITIVE_INFINITY;
      }

      return tableData.filter((row: { [x: string]: any }) => {
        const date = row[propertyKey];
        if (!(date instanceof Date)) return;
        const dateInMs = date.getTime();
        if (dateInMs >= startDateInMs && dateInMs <= endDateInMs) return row;
      });
    },
  },
};

export default TableFilterMixin;
