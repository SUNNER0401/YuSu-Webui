<template>
  <b-container fluid>
    <page-title />
    <b-row class="align-items-start">
      <b-col sm="8" xl="6" class="d-sm-flex align-items-end mb-4">
        <search
          :placeholder="$t('pageOperatingLogs.table.searchLogs')"
          data-test-id="operatingLogs-input-searchLogs"
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
        <div class="ml-sm-4">
          <table-cell-count
            :filtered-items-count="filteredRows"
            :total-number-of-cells="allLogs.length"
          ></table-cell-count>
        </div>
      </b-col>
      <b-col sm="8" md="7" xl="6">
        <table-date-filter @change="onChangeDateTimeFilter" />
      </b-col>
    </b-row>
    <b-row>
      <b-col class="text-right">
        <table-filter :filters="tableFilters" @filter-change="onFilterChange" />
        <b-button
          variant="link"
          :disabled="allLogs.length === 0"
          @click="deleteAllLogs"
        >
          <icon-delete /> {{ $t('global.action.deleteAll') }}
        </b-button>
        <b-button variant="primary" href="/download/audit" @click="download">
          <icon-download /> {{ $t('global.action.download') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          id="table-operating-logs"
          ref="table"
          responsive="md"
          selectable
          no-select-on-click
          sort-icon-left
          hover
          no-sort-reset
          sort-desc
          show-empty
          sort-by="id"
          :fields="fields"
          :items="filteredLogs"
          :sort-compare="onSortCompare"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
          :per-page="perPage"
          :current-page="currentPage"
          :filter="searchFilter"
          @filtered="onFiltered"
          @row-selected="onRowSelected($event, filteredLogs.length)"
        >
          <!-- Severity column -->
          <template #cell(severity)="{ value }">
            <status-icon v-if="value" :status="statusIcon(value)" />
            {{ value }}
          </template>
          <!-- Date column -->
          <template #cell(date)="{ value }">
            <p class="mb-0">{{ value | formatDate }}</p>
            <p class="mb-0">{{ value | formatTime }}</p>
          </template>

          <template #cell(filterByStatus)="{ value }">
            {{ value }}
          </template>
        </b-table>
      </b-col>
    </b-row>

    <!-- Table pagination -->
    <b-row>
      <b-col sm="6">
        <b-form-group
          class="table-pagination-select"
          :label="$t('global.table.itemsPerPage')"
          label-for="pagination-items-per-page"
        >
          <b-form-select
            id="pagination-items-per-page"
            v-model="perPage"
            :options="itemsPerPageOptions"
          />
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-pagination
          v-model="currentPage"
          first-number
          last-number
          :per-page="perPage"
          :total-rows="getTotalRowCount(filteredRows)"
          aria-controls="table-operating-logs"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import IconDelete from '@carbon/icons-vue/es/trash-can/20';
import IconDownload from '@carbon/icons-vue/es/download/20';

import PageTitle from '@/components/Global/PageTitle.vue';
import StatusIcon from '@/components/Global/StatusIcon.vue';
import Search from '@/components/Global/Search.vue';
import TableCellCount from '@/components/Global/TableCellCount.vue';
import TableDateFilter from '@/components/Global/TableDateFilter.vue';
import TableFilter from '@/components/Global/TableFilter.vue';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import TableFilterMixin from '@/components/Mixins/TableFilterMixin';
import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import TableRowExpandMixin from '@/components/Mixins/TableRowExpandMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';

export default {
  name: 'OperatingLogs',
  components: {
    IconDelete,
    IconDownload,
    PageTitle,
    Search,
    StatusIcon,
    TableCellCount,
    TableFilter,
    TableDateFilter,
  },
  mixins: [
    BVPaginationMixin,
    BVTableSelectableMixin,
    BVToastMixin,
    LoadingBarMixin,
    TableFilterMixin,
    DataFormatterMixin,
    TableSortMixin,
    TableRowExpandMixin,
    SearchFilterMixin,
  ],
  beforeRouteLeave(to: any, from: any, next: any): void {
    // Hide loader if the user navigates to another page
    // before request is fulfilled.
    this.hideLoader();
    next();
  },
  data(): Record<string, unknown> {
    return {
      fields: [
        {
          key: 'id',
          label: this.$t('pageOperatingLogs.table.id'),
          sortable: true,
        },
        {
          key: 'interface',
          label: this.$t('pageOperatingLogs.table.interface'),
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'ip',
          label: this.$t('pageOperatingLogs.table.ip'),
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'username',
          label: this.$t('pageOperatingLogs.table.user'),
          tdClass: 'text-break',
        },
        {
          key: 'message',
          label: this.$t('pageOperatingLogs.table.message'),
          tdClass: 'text-break',
        },
        {
          key: 'date',
          label: this.$t('pageOperatingLogs.table.time'),
          tdClass: 'text-break',
        },
      ],
      activeFilters: [],
      currentPage: currentPage,
      filterStartDate: null,
      filterEndDate: null,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    interfaces(): ArrayConstructor {
      let interfaces = this.filteredLogs.map((log: { interface: any }) => {
        return log.interface;
      });
      interfaces = new Set(interfaces);
      interfaces = Array.from(interfaces);
      return interfaces;
    },
    tableFilters(): Record<string, unknown>[] {
      return [
        {
          key: 'interface',
          label: this.$t('pageOperatingLogs.table.interface'),
          values: this.interfaces,
        },
      ];
    },
    href(): string {
      return `data:text/json;charset=utf-8,${this.exportAllLogs()}`;
    },
    filteredRows(): any {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredLogs.length;
    },
    allLogs(): any {
      return this.$store.getters['operatingLogs/allEvents'].map(
        (event: any) => {
          return {
            ...event,
          };
        }
      );
    },
    filteredLogsByDate(): any {
      return this.getFilteredTableDataByDate(
        this.allLogs,
        this.filterStartDate,
        this.filterEndDate
      );
    },
    filteredLogs(): any {
      return this.getFilteredTableData(
        this.filteredLogsByDate,
        this.activeFilters
      );
    },
  },
  mounted(): void {
    this.startLoader();
    this.$store
      .dispatch('operatingLogs/getEventLogData')
      .finally(() => this.endLoader());
  },
  methods: {
    deleteAllLogs(): void {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageOperatingLogs.modal.deleteAllMessage'), {
          title: this.$t('pageOperatingLogs.modal.deleteAllTitle'),
          okTitle: this.$t('global.action.delete'),
          okVariant: 'danger',
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((deleteConfirmed: any) => {
          if (deleteConfirmed) {
            this.$store
              .dispatch('operatingLogs/deleteAllEventLogs', this.allLogs)
              .then((message: string) => this.successToast(message))
              .catch(({ message }: any) => this.errorToast(message));
          }
        });
    },
    onFilterChange({ activeFilters }: any): void {
      this.activeFilters = activeFilters;
    },
    onSortCompare(a: any, b: any, key: string): any {
      if (key === 'severity') {
        return this.sortStatus(a, b, key);
      }
    },
    onChangeDateTimeFilter({
      fromDate,
      toDate,
    }: {
      fromDate: any;
      toDate: any;
    }): any {
      this.filterStartDate = fromDate;
      this.filterEndDate = toDate;
    },
    onFiltered(filteredItems: string | any[]): void {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    // Create export file name based on date
    download(): void {
      this.$store
        .dispatch('operatingLogs/download')
        .then((value: any) => {
          this.successToast(value);
        })
        .catch(({ message }: any) => {
          this.errorToast(message);
        });
    },
  },
};
</script>
