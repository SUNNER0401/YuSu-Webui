<template>
  <b-container fluid>
    <page-title />
    <div v-if="rasAvaliable === true">
      <b-row class="align-items-start">
        <b-col sm="8" xl="6" class="d-sm-flex align-items-end mb-4">
          <search
            :placeholder="$t('pageEventLogs.table.searchLogs')"
            data-test-id="rasLogs-input-searchLogs"
            @change-search="onChangeSearchInput"
            @clear-search="onClearSearchInput"
          />
          <div class="ml-sm-4">
            <table-cell-count
              :filtered-items-count="filteredRows"
              :total-number-of-cells="allRasLogs.length"
            ></table-cell-count>
          </div>
        </b-col>
        <b-col sm="8" md="7" xl="6">
          <table-date-filter @change="onChangeDateTimeFilter" />
        </b-col>
      </b-row>
      <b-row>
        <b-col class="text-right">
          <table-filter
            :filters="tableFilters"
            @filter-change="onFilterChange"
          />
          <b-button
            variant="link"
            :disabled="allRasLogs.length === 0"
            @click="deleteAllRasLogs"
          >
            <icon-delete /> {{ $t('global.action.deleteAll') }}
          </b-button>
          <b-button
            variant="primary"
            :class="{ disabled: allRasLogs.length === 0 }"
            :download="exportFileNameByDate()"
            :href="href"
          >
            <icon-download /> {{ $t('global.action.downloadAll') }}
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <table-toolbar
            ref="toolbar"
            :selected-items-count="selectedRows.length"
            :actions="batchActions"
            @clear-selected="clearSelectedRows($refs.table)"
            @batch-action="onBatchAction"
          >
          </table-toolbar>
          <b-table
            id="table-ras-logs"
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
            <!-- Checkbox column -->
            <template #head(checkbox)>
              <b-form-checkbox
                v-model="tableHeaderCheckboxModel"
                data-test-id="rasLogs-checkbox-selectAll"
                :indeterminate="tableHeaderCheckboxIndeterminate"
                @change="onChangeHeaderCheckbox($refs.table)"
              >
                <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
              </b-form-checkbox>
            </template>
            <template #cell(checkbox)="row">
              <b-form-checkbox
                v-model="row.rowSelected"
                :data-test-id="`rasLogs-checkbox-selectRow-${row.index}`"
                @change="toggleSelectRow($refs.table, row.index)"
              >
                <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
              </b-form-checkbox>
            </template>

            <!-- Expand chevron icon -->
            <template #cell(expandRow)="row">
              <b-button
                variant="link"
                :aria-label="expandRowLabel"
                :title="expandRowLabel"
                class="btn-icon-only"
                @click="toggleRowDetails(row)"
              >
                <icon-chevron />
              </b-button>
            </template>

            <template #row-details="{ item }">
              <b-container fluid>
                <b-row>
                  <b-col>
                    <dl>
                      <!-- Name -->
                      <dt>{{ $t('pageEventLogs.table.name') }}:</dt>
                      <dd>{{ dataFormatter(item.name) }}</dd>
                    </dl>
                    <dl>
                      <!-- Type -->
                      <dt>{{ $t('pageEventLogs.table.type') }}:</dt>
                      <dd>{{ dataFormatter(item.type) }}</dd>
                    </dl>
                  </b-col>
                </b-row>
              </b-container>
            </template>

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

            <!-- Actions column -->
            <template #cell(actions)="row">
              <table-row-action
                v-for="(action, index) in row.item.actions"
                :key="index"
                :value="action.value"
                :title="action.title"
                :row-data="row.item"
                :export-name="exportFileNameByDate('export')"
                :data-test-id="`rasLogs-button-deleteRow-${row.index}`"
                @click-table-action="onTableRowAction($event, row.item)"
              >
                <template #icon>
                  <icon-view v-if="action.value === 'view'" />
                  <icon-download v-if="action.value === 'download'" />
                  <icon-trashcan v-if="action.value === 'delete'" />
                </template>
              </table-row-action>
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
            aria-controls="table-ras-logs"
          />
        </b-col>
      </b-row>
    </div>
    <div v-else>
      <b-row>
        <b-col> {{ $t('pagepageRasLogs.notSupport') }} </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script lang="ts">
import IconDelete from '@carbon/icons-vue/es/trash-can/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';
import IconDownload from '@carbon/icons-vue/es/download/20';
import IconView from '@carbon/icons-vue/es/view/20';

import PageTitle from '@/components/Global/PageTitle';
import StatusIcon from '@/components/Global/StatusIcon';
import Search from '@/components/Global/Search';
import TableCellCount from '@/components/Global/TableCellCount';
import TableDateFilter from '@/components/Global/TableDateFilter';
import TableFilter from '@/components/Global/TableFilter';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';

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
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';

export default {
  name: 'RasLogs',
  components: {
    IconDelete,
    IconTrashcan,
    IconChevron,
    IconDownload,
    IconView,
    PageTitle,
    Search,
    StatusIcon,
    TableCellCount,
    TableFilter,
    TableRowAction,
    TableToolbar,
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
  beforeRouteLeave(to: any, from: any, next: () => void) {
    // Hide loader if the user navigates to another page
    // before request is fulfilled.
    this.hideLoader();
    next();
  },
  data() {
    return {
      rasAvaliable: true,
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
        },
        {
          key: 'checkbox',
          sortable: false,
        },
        {
          key: 'id',
          label: this.$t('pageEventLogs.table.id'),
          sortable: true,
        },
        {
          key: 'severity',
          label: this.$t('pageEventLogs.table.severity'),
          sortable: true,
          tdClass: 'text-nowrap',
          thClass: 'text-nowrap',
        },
        {
          key: 'date',
          label: this.$t('pageEventLogs.table.date'),
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'description',
          label: this.$t('pageEventLogs.table.description'),
          tdClass: 'text-break',
        },
        {
          key: 'actions',
          sortable: false,
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      tableFilters: [
        {
          key: 'severity',
          label: this.$t('pageEventLogs.table.severity'),
          values: ['OK', 'Warning', 'Critical'],
        },
      ],
      expandRowLabel,
      activeFilters: [],
      batchActions: [
        {
          value: 'download',
          label: this.$t('global.action.download'),
        },
        {
          value: 'delete',
          label: this.$t('global.action.delete'),
        },
      ],
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
    href() {
      return `data:text/json;charset=utf-8,${this.exportAllRasLogs()}`;
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredLogs.length;
    },
    allRasLogs() {
      return this.$store.getters['rasLogs/allRasLogs'].map(
        (rasevent: any[]) => {
          return {
            ...rasevent,
            actions: [
              { value: 'view', title: this.$t('global.action.preview') },
              {
                value: 'download',
                title: this.$t('global.action.download'),
              },
              {
                value: 'delete',
                title: this.$t('global.action.delete'),
              },
            ],
          };
        }
      );
    },
    batchExportData() {
      return this.selectedRows.map((row: Record<string, unknown>) =>
        this._.omit(row, 'actions')
      );
    },
    filteredLogsByDate() {
      return this.getFilteredTableDataByDate(
        this.allRasLogs,
        this.filterStartDate,
        this.filterEndDate
      );
    },
    filteredLogs() {
      return this.getFilteredTableData(
        this.filteredLogsByDate,
        this.activeFilters
      );
    },
  },
  async mounted() {
    this.startLoader();
    await this.$store.dispatch('rasLogs/getRasResource').catch(() => {
      this.rasAvaliable = false;
      this.endLoader();
    });
    if (!this.rasAvaliable) return;
    this.$store
      .dispatch('rasLogs/getRasLogData')
      .finally(() => this.endLoader());
  },
  methods: {
    deleteAllRasLogs() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageEventLogs.modal.deleteAllMessage'), {
          title: this.$t('pageEventLogs.modal.deleteAllTitle'),
          okTitle: this.$t('global.action.delete'),
          okVariant: 'danger',
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((deleteConfirmed: boolean) => {
          if (deleteConfirmed) {
            this.$store
              .dispatch('rasLogs/deleteAllRasLogs', this.allRasLogs)
              .then((message: string) => this.successToast(message))
              .catch(({ message }: { message: string }) =>
                this.errorToast(message)
              );
          }
        });
    },
    deleteLogs(uris: string[]) {
      this.$store
        .dispatch('rasLogs/deleteRasLogs', uris)
        .then((messages: { type: string; message: string }[]) => {
          messages.forEach(({ type, message }) => {
            if (type === 'success') {
              this.successToast(message);
            } else if (type === 'error') {
              this.errorToast(message);
            }
          });
        });
    },
    exportAllRasLogs() {
      {
        return this.$store.getters['rasLogs/allRasLogs'].map((rasLogs: any) => {
          const allEventLogsString = JSON.stringify(rasLogs);
          return allEventLogsString;
        });
      }
    },
    downloadRasLogs(uris: string[]) {
      this.$store.dispatch('rasLogs/downloadRasLogs', uris);
    },
    onFilterChange({ activeFilters }: { activeFilters: any }) {
      this.activeFilters = activeFilters;
    },
    onSortCompare(a: any, b: any, key: string) {
      if (key === 'severity') {
        return this.sortStatus(a, b, key);
      }
    },
    onTableRowAction(action: string, { uri, additionalDataUri }: any) {
      if (action === 'delete') {
        this.$bvModal
          .msgBoxConfirm(this.$tc('pageEventLogs.modal.deleteMessage'), {
            title: this.$tc('pageEventLogs.modal.deleteTitle'),
            okTitle: this.$t('global.action.delete'),
            cancelTitle: this.$t('global.action.cancel'),
          })
          .then((deleteConfirmed: boolean) => {
            if (deleteConfirmed) this.deleteLogs([uri]);
          });
      }
      if (action === 'download') {
        this.downloadRasLogs([additionalDataUri]);
      }
      if (action === 'view') {
        this.$store.dispatch('rasLogs/viewRasLog', additionalDataUri);
      }
    },
    onBatchAction(action: string) {
      if (action === 'delete') {
        const uris = this.selectedRows.map((row: { uri: string }) => row.uri);
        this.$bvModal
          .msgBoxConfirm(
            this.$tc(
              'pageEventLogs.modal.deleteMessage',
              this.selectedRows.length
            ),
            {
              title: this.$tc(
                'pageEventLogs.modal.deleteTitle',
                this.selectedRows.length
              ),
              okTitle: this.$t('global.action.delete'),
              cancelTitle: this.$t('global.action.cancel'),
            }
          )
          .then((deleteConfirmed: any) => {
            if (deleteConfirmed) {
              if (this.selectedRows.length === this.allRasLogs.length) {
                this.$store
                  .dispatch(
                    'rasLogs/deleteAllRasLogs',
                    this.selectedRows.length
                  )
                  .then((message: any) => this.successToast(message))
                  .catch(({ message }: { message: string }) =>
                    this.errorToast(message)
                  );
              } else {
                this.deleteLogs(uris);
              }
            }
          });
      }
      if (action === 'download') {
        const additionalDataUris = this.selectedRows.map(
          (row: { additionalDataUri: string }) => row.additionalDataUri
        );
        this.downloadRasLogs(additionalDataUris);
      }
    },
    onChangeDateTimeFilter({
      fromDate,
      toDate,
    }: {
      fromDate: string;
      toDate: string;
    }) {
      this.filterStartDate = fromDate;
      this.filterEndDate = toDate;
    },
    onFiltered(filteredItems: string | any[]) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    // Create export file name based on date
    exportFileNameByDate(value: string) {
      let date: Date | string = new Date();
      date =
        date.toISOString().slice(0, 10) +
        '_' +
        date.toString().split(':').join('-').split(' ')[4];
      let fileName;
      if (value === 'export') {
        fileName = 'ras_log_';
      } else {
        fileName = 'all_ras_logs_';
      }
      return fileName + date;
    },
  },
};
</script>
