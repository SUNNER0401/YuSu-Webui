<template>
  <page-section :section-title="$t('pageInventory.processors')">
    <!-- Search -->
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
          :total-number-of-cells="processors.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      sort-icon-left
      no-sort-reset
      hover
      responsive="md"
      show-empty
      :items="processors"
      :fields="fields"
      :sort-desc="true"
      :filter="searchFilter"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
      @filtered="onFiltered"
    >
      <!-- Expand button -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandProcessors"
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
          v-if="hasIdentifyLed(row.item.identifyLed)"
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
        <div v-else>--</div>
      </template>

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Name -->
                <dt v-if="item.name">{{ $t('pageInventory.table.name') }}:</dt>
                <dd v-if="item.name">{{ dataFormatter(item.name) }}</dd>
                <!-- Part Number -->
                <dt v-if="item.partNumber">
                  {{ $t('pageInventory.table.partNumber') }}:
                </dt>
                <dd v-if="item.partNumber">
                  {{ dataFormatter(item.partNumber) }}
                </dd>
                <!-- Serial Number -->
                <dt v-if="item.serialNumber">
                  {{ $t('pageInventory.table.serialNumber') }}:
                </dt>
                <dd v-if="item.serialNumber">
                  {{ dataFormatter(item.serialNumber) }}
                </dd>
                <!-- Spare Part Number -->
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
                <!-- Asset Tag -->
                <dt v-if="item.assetTag">
                  {{ $t('pageInventory.table.assetTag') }}:
                </dt>
                <dd v-if="item.assetTag">{{ dataFormatter(item.assetTag) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Status state -->
                <dt v-if="item.statusState">
                  {{ $t('pageInventory.table.statusState') }}:
                </dt>
                <dd v-if="item.statusState">
                  {{ dataFormatter(item.statusState) }}
                </dd>
                <!-- Health Rollup -->
                <dt v-if="item.healthRollup">
                  {{ $t('pageInventory.table.healthRollup') }}:
                </dt>
                <dd v-if="item.healthRollup">
                  {{ dataFormatter(item.healthRollup) }}
                </dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col class="mt-1" sm="6" xl="6">
              <dl>
                <!-- Manufacturer -->
                <dt v-if="item.manufacturer">
                  {{ $t('pageInventory.table.manufacturer') }}:
                </dt>
                <dd v-if="item.manufacturer">
                  {{ dataFormatter(item.manufacturer) }}
                </dd>
                <!-- Processor Type -->
                <dt v-if="item.processorType">
                  {{ $t('pageInventory.table.processorType') }}:
                </dt>
                <dd v-if="item.processorType">
                  {{ dataFormatter(item.processorType) }}
                </dd>
                <!-- Processor Architecture -->
                <dt v-if="item.processorArchitecture">
                  {{ $t('pageInventory.table.processorArchitecture') }}:
                </dt>
                <dd v-if="item.processorArchitecture">
                  {{ dataFormatter(item.processorArchitecture) }}
                </dd>
                <!-- Instruction Set -->
                <dt v-if="item.instructionSet">
                  {{ $t('pageInventory.table.instructionSet') }}:
                </dt>
                <dd v-if="item.instructionSet">
                  {{ dataFormatter(item.instructionSet) }}
                </dd>
                <!-- Version -->
                <dt v-if="item.version">
                  {{ $t('pageInventory.table.version') }}:
                </dt>
                <dd v-if="item.version">{{ dataFormatter(item.version) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-1" sm="6" xl="6">
              <dl>
                <!-- Min Speed MHz -->
                <dt v-if="item.minSpeedMHz">
                  {{ $t('pageInventory.table.minSpeedMHz') }}:
                </dt>
                <dd v-if="item.minSpeedMHz">
                  {{ dataFormatter(item.minSpeedMHz) }}
                </dd>
                <!-- Max Speed MHz -->
                <dt v-if="item.maxSpeedMHz">
                  {{ $t('pageInventory.table.maxSpeedMHz') }}:
                </dt>
                <dd v-if="item.maxSpeedMHz">
                  {{ dataFormatter(item.maxSpeedMHz) }}
                </dd>
                <!-- Total Cores -->
                <dt v-if="item.totalCores">
                  {{ $t('pageInventory.table.totalCores') }}:
                </dt>
                <dd v-if="item.totalCores">
                  {{ dataFormatter(item.totalCores) }}
                </dd>
                <!-- Total Threads -->
                <dt v-if="item.totalThreads">
                  {{ $t('pageInventory.table.totalThreads') }}:
                </dt>
                <dd v-if="item.totalThreads">
                  {{ dataFormatter(item.totalThreads) }}
                </dd>
              </dl>
            </b-col>
          </b-row>
          <template v-for="(cache, index) in item.Oem">
            <div :key="index" class="section-divider mb-3 mt-3"></div>
            <b-row :key="index">
              <b-col cols="12">
                <h4 v-if="cache.CacheLevel === 'L1 cache'">
                  {{ $t('pageInventory.table.cacheLevelL1') }}
                </h4>
                <h4 v-else-if="cache.CacheLevel === 'L2 cache'">
                  {{ $t('pageInventory.table.cacheLevelL2') }}
                </h4>
                <h4 v-else>
                  <!-- 三级缓存 -->
                  {{ $t('pageInventory.table.cacheLevelL3') }}
                </h4>
              </b-col>
              <b-col class="mt-1" sm="6" xl="6">
                <dl>
                  <dt v-if="cache.Associativity">
                    {{ $t('pageInventory.table.associativity') }}:
                  </dt>
                  <dd v-if="cache.Associativity">
                    {{ dataFormatter(cache.Associativity) }}
                  </dd>
                  <dt v-if="cache.CacheLocation">
                    {{ $t('pageInventory.table.cacheLocation') }}:
                  </dt>
                  <dd v-if="cache.CacheLocation">
                    {{ dataFormatter(cache.CacheLocation) }}
                  </dd>
                  <dt v-if="cache.CacheSocketed">
                    {{ $t('pageInventory.table.cacheSocketed') }}:
                  </dt>
                  <dd v-if="cache.CacheSocketed">
                    {{ dataFormatter(cache.CacheSocketed) }}
                  </dd>
                  <dt v-if="cache.CurrentSRAMType">
                    {{ $t('pageInventory.table.currentSRAMType') }}:
                  </dt>
                  <dd v-if="cache.CurrentSRAMType">
                    {{ dataFormatter(cache.CurrentSRAMType) }}
                  </dd>
                  <dt v-if="cache.ErrorCorrectionType">
                    {{ $t('pageInventory.table.errorCorrectionType') }}:
                  </dt>
                  <dd v-if="cache.ErrorCorrectionType">
                    {{ dataFormatter(cache.ErrorCorrectionType) }}
                  </dd>
                  <dt v-if="cache.InstalledCacheSizeInKB">
                    {{ $t('pageInventory.table.installedCacheSizeInKB') }}:
                  </dt>
                  <dd v-if="cache.InstalledCacheSizeInKB">
                    {{ dataFormatter(cache.InstalledCacheSizeInKB) }}
                  </dd>
                  <dt v-if="cache.MaxCacheSizeInKB">
                    {{ $t('pageInventory.table.maxCacheSizeInKB') }}:
                  </dt>
                  <dd v-if="cache.MaxCacheSizeInKB">
                    {{ dataFormatter(cache.MaxCacheSizeInKB) }}
                  </dd>
                </dl>
              </b-col>
              <b-col class="mt-1" sm="6" xl="6">
                <dl>
                  <dt v-if="cache.OperationalMode">
                    {{ $t('pageInventory.table.operationalMode') }}:
                  </dt>
                  <dd v-if="cache.OperationalMode">
                    {{ dataFormatter(cache.OperationalMode) }}
                  </dd>
                  <dt v-if="cache.SocketDesignation">
                    {{ $t('pageInventory.table.socketDesignation') }}:
                  </dt>
                  <dd v-if="cache.SocketDesignation">
                    {{ dataFormatter(cache.SocketDesignation) }}
                  </dd>
                  <dt v-if="cache.Speed">
                    {{ $t('pageInventory.table.speed') }}:
                  </dt>
                  <dd v-if="cache.Speed">
                    {{ dataFormatter(cache.Speed) }}
                  </dd>
                  <dt v-if="cache.Status">
                    {{ $t('pageInventory.table.status') }}:
                  </dt>
                  <dd v-if="cache.Status">
                    {{ dataFormatter(cache.Status) }}
                  </dd>
                  <dt
                    v-if="
                      cache.SupportedSRAMType &&
                      cache.SupportedSRAMType.length > 0
                    "
                  >
                    {{ $t('pageInventory.table.supportedSRAMType') }}:
                  </dt>
                  <dd
                    v-if="
                      cache.SupportedSRAMType &&
                      cache.SupportedSRAMType.length > 0
                    "
                  >
                    <template v-for="(type, i) in cache.SupportedSRAMType">
                      <span v-if="i !== 0" :key="i">，</span>
                      <span :key="i">{{ dataFormatter(type) }}</span>
                    </template>
                  </dd>
                  <dt v-if="cache.SystemCacheType">
                    {{ $t('pageInventory.table.systemCacheType') }}:
                  </dt>
                  <dd v-if="cache.SystemCacheType">
                    {{ dataFormatter(cache.SystemCacheType) }}
                  </dd>
                </dl>
              </b-col>
            </b-row>
          </template>
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
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon, Search, TableCellCount },
  mixins: [
    BVToastMixin,
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
          sortable: false,
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
        : this.processors.length;
    },
    processors() {
      return this.$store.getters['processors/processors'];
    },
  },
  created() {
    this.$store.dispatch('processors/getProcessorsInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-processors-complete');
    });
  },
  methods: {
    onFiltered(filteredItems: string | any[]) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    toggleIdentifyLedValue(row: { uri: any; identifyLed: any }) {
      this.$store
        .dispatch('processors/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }: { message: string }) => this.errorToast(message));
    },
    // TO DO: remove hasIdentifyLed when the following is merged:
    // https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/37045
    hasIdentifyLed(identifyLed: any) {
      return typeof identifyLed === 'boolean';
    },
  },
};
</script>
