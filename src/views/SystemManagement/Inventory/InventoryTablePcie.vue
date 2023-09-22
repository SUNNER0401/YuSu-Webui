<template>
  <page-section :section-title="$t('pageInventory.pcie')">
    <b-row class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="6" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="pcieDevices.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      sort-icon-left
      no-sort-reset
      hover
      responsive="md"
      sort-by="health"
      show-empty
      :items="pcieDevices"
      :fields="fields"
      :sort-desc="true"
      :sort-compare="sortCompare"
      :filter="searchFilter"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
      @filtered="onFiltered"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandPcieDevices"
          :title="expandRowLabel"
          class="btn-icon-only"
          @click="toggleRowDetails(row)"
        >
          <icon-chevron />
          <span class="sr-only">{{ expandRowLabel }}</span>
        </b-button>
      </template>

      <template #row-details="{ item: { details } }">
        <b-container fluid>
          <div v-for="(detail, key) in details" :key="key">
            <b-row>
              <b-col sm="6" xl="4">
                <dl>
                  <!-- Function ID -->
                  <dt v-if="details[key].functionId != null">
                    {{ $t('pageInventory.table.functionId') }}:
                  </dt>
                  <dd v-if="details[key].functionId != null">
                    {{ dataFormatter(details[key].functionId) }}
                  </dd>
                </dl>
                <dl>
                  <!-- Device ID -->
                  <dt v-if="details[key].deviceId">
                    {{ $t('pageInventory.table.deviceId') }}:
                  </dt>
                  <dd v-if="details[key].deviceId">
                    {{ dataFormatter(details[key].deviceId) }}
                  </dd>
                </dl>
                <dl>
                  <!-- Class code -->
                  <dt v-if="details[key].classCode">
                    {{ $t('pageInventory.table.classCode') }}:
                  </dt>
                  <dd v-if="details[key].classCode">
                    {{ dataFormatter(details[key].classCode) }}
                  </dd>
                </dl>
                <dl>
                  <!-- Revision ID -->
                  <dt v-if="details[key].revisionId">
                    {{ $t('pageInventory.table.revisionId') }}:
                  </dt>
                  <dd v-if="details[key].revisionId">
                    {{ dataFormatter(details[key].revisionId) }}
                  </dd>
                </dl>
                <dl>
                  <!-- Vendor ID -->
                  <dt v-if="details[key].vendorID">
                    {{ $t('pageInventory.table.vendorID') }}:
                  </dt>
                  <dd v-if="details[key].vendorID">
                    {{ dataFormatter(details[key].vendorID) }}
                  </dd>
                </dl>
              </b-col>
              <b-col sm="6" xl="4">
                <dl>
                  <!-- Subsystem vendor ID -->
                  <dt v-if="details[key].deviceClass">
                    {{ $t('pageInventory.table.deviceClass') }}:
                  </dt>
                  <dd v-if="details[key].deviceClass">
                    {{ dataFormatter(details[key].deviceClass) }}
                  </dd>
                </dl>
                <dl>
                  <!-- Function type -->
                  <dt v-if="details[key].functionType">
                    {{ $t('pageInventory.table.functionType') }}:
                  </dt>
                  <dd v-if="details[key].functionType">
                    {{ dataFormatter(details[key].functionType) }}
                  </dd>
                </dl>
                <dl>
                  <!-- Subsystem ID -->
                  <dt v-if="details[key].subsystemId">
                    {{ $t('pageInventory.table.subsystemId') }}:
                  </dt>
                  <dd v-if="details[key].subsystemId">
                    {{ dataFormatter(details[key].subsystemId) }}
                  </dd>
                </dl>
                <dl>
                  <!-- Subsystem vendor ID -->
                  <dt v-if="details[key].subsystemVendorID">
                    {{ $t('pageInventory.table.subsystemVendorID') }}:
                  </dt>
                  <dd v-if="details[key].subsystemVendorID">
                    {{ dataFormatter(details[key].subsystemVendorID) }}
                  </dd>
                </dl>
              </b-col>
            </b-row>
            <div
              v-if="key + 1 != details.length"
              class="section-divider mb-3 mt-3"
            ></div>
          </div>
        </b-container>
      </template>
    </b-table>
  </page-section>
</template>

<script lang="ts">
import PageSection from '@/components/Global/PageSection';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';
import TableCellCount from '@/components/Global/TableCellCount';

import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';

export default {
  components: { IconChevron, PageSection, Search, TableCellCount },
  mixins: [
    TableRowExpandMixin,
    DataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
  ],
  data() {
    return {
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
          sortable: false,
        },
        {
          key: 'id',
          label: this.$t('pageInventory.table.id'),
          formatter: (this as any).dataFormatter,
          sortable: true,
        },
        {
          key: 'name',
          label: this.$t('pageInventory.table.name'),
          formatter: (this as any).dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'deviceType',
          label: this.$t('pageInventory.table.deviceType'),
          formatter: (this as any).dataFormatter,
          sortable: true,
        },
      ],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.pcieDevices.length;
    },
    pcieDevices() {
      return this.$store.getters['pcie/pcieDevices'];
    },
  },
  created() {
    this.$store.dispatch('pcie/getPcieInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-pcie-complete');
    });
  },
  methods: {
    sortCompare(a: any, b: any, key: string) {
      if (key === 'id') {
        return this.sortStatus(a, b, key);
      }
    },
    onFiltered(filteredItems: string | any[]) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>
