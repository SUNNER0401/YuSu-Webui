<template>
  <page-section :section-title="$t('pageInventory.dimmSlot')">
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
          :total-number-of-cells="dimms.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      sort-icon-left
      no-sort-reset
      hover
      sort-by="health"
      responsive="md"
      show-empty
      :items="dimms"
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
          data-test-id="hardwareStatus-button-expandDimms"
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
      <!-- Toggle identify LED -->
      <template #cell(identifyLed)="row">
        <b-form-checkbox
          v-model="row.item.identifyLed"
          name="switch"
          switch
          @change="toggleIdentifyLedValue(row.item)"
        >
          <span v-if="row.item.identifyLed">
            {{ $t('global.status.on') }}
          </span>
          <span v-else> {{ $t('global.status.off') }} </span>
        </b-form-checkbox>
      </template>
      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6" xl="6">
              <dl>
                <!-- Part Number -->
                <dt v-if="item.manufacturer">
                  {{ $t('pageInventory.table.manufacturer') }}:
                </dt>
                <dd v-if="item.manufacturer">
                  {{ dataFormatter(item.manufacturer) }}
                </dd>
              </dl>
              <dl>
                <!-- Part Number -->
                <dt v-if="item.partNumber">
                  {{ $t('pageInventory.table.partNumber') }}:
                </dt>
                <dd v-if="item.partNumber">
                  {{ dataFormatter(item.partNumber) }}
                </dd>
              </dl>
              <dl>
                <!-- Serial Number -->
                <dt v-if="item.serialNumber">
                  {{ $t('pageInventory.table.serialNumber') }}:
                </dt>
                <dd v-if="item.serialNumber">
                  {{ dataFormatter(item.serialNumber) }}
                </dd>
              </dl>
              <dl>
                <!-- Spare Part Number -->
                <dt v-if="item.sparePartNumber">
                  {{ $t('pageInventory.table.sparePartNumber') }}:
                </dt>
                <dd v-if="item.sparePartNumber">
                  {{ dataFormatter(item.sparePartNumber) }}
                </dd>
              </dl>
              <dl>
                <!-- Model -->
                <dt v-if="item.model">
                  {{ $t('pageInventory.table.model') }}:
                </dt>
                <dd v-if="item.model">{{ dataFormatter(item.model) }}</dd>
              </dl>
              <dl>
                <!-- Description -->
                <dt v-if="item.description">
                  {{ $t('pageInventory.table.description') }}:
                </dt>
                <dd v-if="item.description">
                  {{ dataFormatter(item.description) }}
                </dd>
              </dl>
              <dl>
                <!-- Memory Type -->
                <dt v-if="item.memoryType">
                  {{ $t('pageInventory.table.memoryType') }}:
                </dt>
                <dd v-if="item.memoryType">
                  {{ dataFormatter(item.memoryType) }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="6">
              <dl>
                <!-- Memory Size in mb -->
                <dt v-if="item.memorySize">
                  {{ $t('pageInventory.table.memorySize') }}:
                </dt>
                <dd v-if="item.memorySize">
                  {{ dataFormatter(item.memorySize) }} MB
                </dd>
              </dl>
              <dl>
                <!-- Status-->
                <dt v-if="item.statusState && item.statusState != 'Disabled'">
                  {{ $t('pageInventory.table.statusState') }}:
                </dt>
                <dd v-if="item.statusState && item.statusState != 'Disabled'">
                  {{ dataFormatter(item.statusState) }}
                </dd>
              </dl>
              <dl>
                <!-- Operating speed Mhz -->
                <dt v-if="item.operatingSpeedMhz">
                  {{ $t('pageInventory.table.operatingSpeedMhz') }}:
                </dt>
                <dd v-if="item.operatingSpeedMhz">
                  {{ dataFormatter(item.operatingSpeedMhz) }}
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
        },
        {
          key: 'id',
          label: this.$t('pageInventory.table.id'),
          formatter: (this as any).dataFormatter,
        },
        {
          key: 'health',
          label: this.$t('pageInventory.table.health'),
          formatter: (this as any).dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageInventory.table.locationNumber'),
          formatter: (this as any).dataFormatter,
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
        : this.dimms.length;
    },
    dimms() {
      return this.$store.getters['memory/dimms'];
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('memory/getDimms').finally(() => {
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
    toggleIdentifyLedValue(row: { uri: any; identifyLed: any }) {
      this.$store
        .dispatch('memory/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }: { message: string }) => this.errorToast(message));
    },
  },
};
</script>
