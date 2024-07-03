<template>
  <b-container fluid>
    <b-row class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          :placeholder="$t('pageSensors.searchForSensors')"
          data-test-id="sensors-input-searchForSensors"
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="3" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="allSensors.length"
        ></table-cell-count>
      </b-col>
      <b-col sm="3" md="4" xl="6" class="text-right">
        <table-filter :filters="tableFilters" @filter-change="onFilterChange" />
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="12">
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          @clear-selected="clearSelectedRows($refs.table)"
        >
          <template #toolbar-buttons>
            <table-toolbar-export
              :data="selectedRows"
              :file-name="exportFileNameByDate()"
            />
          </template>
        </table-toolbar>
        <b-table
          ref="table"
          responsive="md"
          selectable
          no-select-on-click
          sort-icon-left
          hover
          no-sort-reset
          sort-by="status"
          show-empty
          :no-border-collapse="true"
          :items="filteredSensors"
          :fields="fields"
          :sort-desc="true"
          :sort-compare="sortCompare"
          :filter="searchFilter"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
          @filtered="onFiltered"
          @row-selected="onRowSelected($event, filteredSensors.length)"
        >
          <!-- Checkbox column -->
          <template #cell(status)="{ value }">
            <status-icon :status="statusIcon(value)" /> {{ value }}
          </template>
          <template #cell(currentValue)="data">
            <span>{{ data.value }}</span>
            <span v-if="data.value != '--'">{{
              unitFormatter(data.item.units)
            }}</span>
          </template>
          <template #cell(lowerCaution)="data">
            <span>{{ data.value }}</span>
            <span v-if="data.value != '--'">{{
              unitFormatter(data.item.units)
            }}</span>
          </template>
          <template #cell(upperCaution)="data">
            <span>{{ data.value }}</span>
            <span v-if="data.value != '--'">{{
              unitFormatter(data.item.units)
            }}</span>
          </template>
          <template #cell(lowerCritical)="data">
            <span>{{ data.value }}</span>
            <span v-if="data.value != '--'">{{
              unitFormatter(data.item.units)
            }}</span>
          </template>
          <template #cell(upperCritical)="data">
            <span>{{ data.value }}</span>
            <span v-if="data.value != '--'">{{
              unitFormatter(data.item.units)
            }}</span>
          </template>
          <template #cell(dynamicChart)="data">
            <b-button
              @click="
                Task.createTask(
                  data.item.name,
                  data.item.type,
                  data.item.memberId,
                  data.item.lowerCaution,
                  data.item.upperCaution,
                  data.item.lowerCritical,
                  data.item.upperCritical,
                  data.item.currentValue,
                  data.item.units
                )
              "
            >
              {{ $t('pageSensors.table.show') }}
            </b-button>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Search from '@/components/Global/Search';
import StatusIcon from '@/components/Global/StatusIcon';
import TableFilter from '@/components/Global/TableFilter';
import TableToolbar from '@/components/Global/TableToolbar';
import TableToolbarExport from '@/components/Global/TableToolbarExport';
import TableCellCount from '@/components/Global/TableCellCount';
import Task from '@/utilities/windowTask';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import TableFilterMixin from '@/components/Mixins/TableFilterMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';

export default {
  name: 'Sensors',
  components: {
    Search,
    StatusIcon,
    TableCellCount,
    TableFilter,
    TableToolbar,
    TableToolbarExport,
  },
  mixins: [
    TableFilterMixin,
    BVTableSelectableMixin,
    LoadingBarMixin,
    DataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
  ],
  beforeRouteLeave(to: any, from: any, next: () => void) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      fields: [
        {
          key: 'checkbox',
          sortable: false,
          label: '',
        },
        {
          key: 'name',
          sortable: true,
          label: this.$t('pageSensors.table.name'),
        },
        {
          key: 'status',
          sortable: true,
          label: this.$t('pageSensors.table.status'),
          tdClass: 'text-nowrap',
        },
        {
          key: 'lowerCritical',
          formatter: (this as any).dataFormatter,
          label: this.$t('pageSensors.table.lowerCritical'),
        },
        {
          key: 'lowerCaution',
          formatter: (this as any).dataFormatter,
          label: this.$t('pageSensors.table.lowerWarning'),
        },

        {
          key: 'currentValue',
          formatter: (this as any).dataFormatter,
          label: this.$t('pageSensors.table.currentValue'),
        },
        {
          key: 'upperCaution',
          formatter: (this as any).dataFormatter,
          label: this.$t('pageSensors.table.upperWarning'),
        },
        {
          key: 'upperCritical',
          formatter: (this as any).dataFormatter,
          label: this.$t('pageSensors.table.upperCritical'),
        },
        {
          key: 'dynamicChart',
          formatter: (this as any).dataFormatter,
          label: this.$t('pageSensors.table.dynamicChart'),
        },
      ],
      tableFilters: [
        {
          key: 'status',
          label: this.$t('pageSensors.table.status'),
          values: ['OK', 'Warning', 'Critical'],
        },
      ],
      activeFilters: [],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
      Task: Task,
      // 添加假数据
      fakeSensors: [
        {
          name: 'Sensor 1',
          status: 'OK',
          lowerCritical: 10,
          lowerCaution: 20,
          currentValue: 30,
          upperCaution: 40,
          upperCritical: 50,
          dynamicChart: false,
        },
        {
          name: 'Sensor 2',
          status: 'Warning',
          lowerCritical: 5,
          lowerCaution: 15,
          currentValue: 25,
          upperCaution: 35,
          upperCritical: 45,
          dynamicChart: false,
        },
        {
          name: 'Sensor 3',
          status: 'Critical',
          lowerCritical: 2,
          lowerCaution: 12,
          currentValue: 22,
          upperCaution: 32,
          upperCritical: 42,
          dynamicChart: false,
        },
      ],
    };
  },
  computed: {
    allSensors() {
      // 需要打开
      /*
      let allSensors = this.$store.getters['sensors/sensors'].slice(0);
      allSensors = allSensors.sort(
        (sensor1: { name: number }, sensor2: { name: number }) => {
          return sensor2.name < sensor1.name ? 1 : -1;
        }
      );
      return allSensors;
      */
      //需要注释
      return this.fakeSensors;
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredSensors.length;
    },
    filteredSensors() {
      return this.getFilteredTableData(this.allSensors, this.activeFilters);
    },
  },
  methods: {
    sortCompare(a: any, b: any, key: string) {
      if (key === 'status') {
        return this.sortStatus(a, b, key);
      }
    },
    onFilterChange({ activeFilters }: { activeFilters: any }) {
      this.activeFilters = activeFilters;
    },
    onFiltered(filteredItems: string | any[]) {
      this.searchTotalFilteredRows = filteredItems.length;
    },

    // 需要打开
    onChangeSearchInput(event: any) {
      this.searchFilter = event;
    },
    // 需要注释
    // onChangeSearchInput(value: any) {
    //   this.searchFilter = value;
    // },

    // 需要打开
    // exportFileNameByDate() {
    //   let date: Date | string = new Date();
    //   date =
    //     date.toISOString().slice(0, 10) +
    //     '_' +
    //     date.toString().split(':').join('-').split(' ')[4];
    //   return this.$t('pageSensors.exportFilePrefix') + date;
    // },
    // 需要注释
    exportFileNameByDate() {
      const date = new Date().toISOString().split('T')[0];
      return `Sensors_${date}.csv`;
    },
  },
};
</script>
