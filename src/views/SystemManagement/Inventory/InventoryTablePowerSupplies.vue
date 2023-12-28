<template>
  <page-section :section-title="$t('pageInventory.powerSupplies')">
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
          :total-number-of-cells="powerSupplies.length"
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
      :items="powerSupplies"
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
          data-test-id="hardwareStatus-button-expandPowerSupplies"
          :title="expandRowLabel"
          class="btn-icon-only"
          @click="toggleRowDetails(row)"
        >
          <icon-chevron />
          <span class="sr-only">{{ expandRowLabel }}</span>
        </b-button>
      </template>

      <!-- Health -->
      <template #cell(health)="{ value }">
        <status-icon :status="statusIcon(value)" />
        {{ value }}
      </template>

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Name -->
                <dt v-if="item.name">{{ $t('pageInventory.table.name') }}:</dt>
                <dd v-if="item.name">{{ dataFormatter(item.name) }}</dd>
                <!-- Part number -->
                <dt v-if="item.partNumber">
                  {{ $t('pageInventory.table.partNumber') }}:
                </dt>
                <dd v-if="item.partNumber">
                  {{ dataFormatter(item.partNumber) }}
                </dd>
                <!-- Serial number -->
                <dt v-if="item.serialNumber">
                  {{ $t('pageInventory.table.serialNumber') }}:
                </dt>
                <dd v-if="item.serialNumber">
                  {{ dataFormatter(item.serialNumber) }}
                </dd>
                <!-- Spare part number -->
                <dt v-if="item.sparePartNumber">
                  {{ $t('pageInventory.table.sparePartNumber') }}:
                </dt>
                <dd v-if="item.sparePartNumber">
                  {{ dataFormatter(item.sparePartNumber) }}
                </dd>
                <!-- Model -->
                <dt v-if="item.model">
                  {{ $t('pageInventory.table.model') }}:
                </dt>
                <dd v-if="item.model">{{ dataFormatter(item.model) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Status state -->
                <dt v-if="item.statusState">
                  {{ $t('pageInventory.table.statusState') }}:
                </dt>
                <dd v-if="item.statusState">
                  {{ dataFormatter(item.statusState) }}
                </dd>
                <!-- Status Health rollup state -->
                <dt v-if="item.statusHealth">
                  {{ $t('pageInventory.table.statusHealthRollup') }}:
                </dt>
                <dd v-if="item.statusHealth">
                  {{ dataFormatter(item.statusHealth) }}
                </dd>
                <!-- Efficiency percent -->
                <dt v-if="item.efficiencyPercent">
                  {{ $t('pageInventory.table.efficiencyPercent') }}:
                </dt>
                <dd v-if="item.efficiencyPercent">
                  {{ dataFormatter(item.efficiencyPercent) }}
                </dd>
                <!-- Power input watts -->
                <dt v-if="item.powerInputWatts">
                  {{ $t('pageInventory.table.powerInputWatts') }}:
                </dt>
                <dd v-if="item.powerInputWatts">
                  {{ dataFormatter(item.powerInputWatts) }}
                </dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Manufacturer -->
                <dt v-if="item.manufacturer">
                  {{ $t('pageInventory.table.manufacturer') }}:
                </dt>
                <dd v-if="item.manufacturer">
                  {{ dataFormatter(item.manufacturer) }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Firmware version -->
                <dt v-if="item.firmwareVersion">
                  {{ $t('pageInventory.table.firmwareVersion') }}:
                </dt>
                <dd v-if="item.firmwareVersion">
                  {{ dataFormatter(item.firmwareVersion) }}
                </dd>
              </dl>
            </b-col>
          </b-row>
        </b-container>
      </template>
    </b-table>
  </page-section>
</template>

<script lang="ts">
import PageSection from '@/components/Global/PageSection';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';

import StatusIcon from '@/components/Global/StatusIcon';
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
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon, Search, TableCellCount },
  mixins: [
    TableRowExpandMixin,
    DataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
    LoadingBarMixin,
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
          key: 'health',
          label: this.$t('pageInventory.table.health'),
          formatter: (this as any).dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageInventory.table.locationNumber'),
          formatter: (this as any).dataFormatter,
          sortable: true,
        },
        {
          key: 'identifyLed',
          label: this.$t('pageInventory.table.identifyLed'),
          formatter: (this as any).dataFormatter,
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
        : this.powerSupplies.length;
    },
    powerSupplies() {
      return this.$store.getters['powerSupply/powerSupplies'];
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('powerSupply/getAllPowerSupplies').finally(() => {
      // Emit initial data fetch complete to parent component
      this.endLoader();
    });
  },
  methods: {
    sortCompare(a: any, b: any, key: string) {
      if (key === 'health') {
        return this.sortStatus(a, b, key);
      }
    },
    onFiltered(filteredItems: string | any[]) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>
