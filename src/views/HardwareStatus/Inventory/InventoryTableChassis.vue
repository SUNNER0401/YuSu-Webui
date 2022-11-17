<template>
  <page-section :section-title="$t('pageInventory.chassis')">
    <b-table
      responsive="md"
      hover
      :items="chassis"
      :fields="fields"
      show-empty
      :empty-text="$t('global.table.emptyMessage')"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandChassis"
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
                <!-- Part number -->
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
                <!-- Model -->
                <dt v-if="item.model">
                  {{ $t('pageInventory.table.model') }}:
                </dt>
                <dd v-if="item.model" class="mb-2">
                  {{ dataFormatter(item.model) }}
                </dd>
                <!-- Asset tag -->
                <dt v-if="item.assetTag">
                  {{ $t('pageInventory.table.assetTag') }}:
                </dt>
                <dd v-if="item.assetTag" class="mb-2">
                  {{ dataFormatter(item.assetTag) }}
                </dd>
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
                <!-- Power state -->
                <dt v-if="item.power">
                  {{ $t('pageInventory.table.power') }}:
                </dt>
                <dd v-if="item.power">{{ dataFormatter(item.power) }}</dd>
                <!-- Health rollup -->
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
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageInventory.table.manufacturer') }}:</dt>
                <dd>{{ dataFormatter(item.manufacturer) }}</dd>
                <!-- Chassis Type -->
                <dt>{{ $t('pageInventory.table.chassisType') }}:</dt>
                <dd>{{ dataFormatter(item.chassisType) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Min power -->
                <dt v-if="item.minPowerWatts">
                  {{ $t('pageInventory.table.minPowerWatts') }}:
                </dt>
                <dd v-if="item.minPowerWatts">
                  {{ dataFormatter(item.minPowerWatts) }}
                </dd>
                <!-- Max power -->
                <dt v-if="item.maxPowerWatts">
                  {{ $t('pageInventory.table.maxPowerWatts') }}:
                </dt>
                <dd v-if="item.maxPowerWatts">
                  {{ dataFormatter(item.maxPowerWatts) }}
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
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import StatusIcon from '@/components/Global/StatusIcon';

import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon },
  mixins: [BVToastMixin, TableRowExpandMixin, DataFormatterMixin],
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
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    chassis() {
      return this.$store.getters['chassis/chassis'];
    },
  },
  created() {
    this.$store.dispatch('chassis/getChassisInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-chassis-complete');
    });
  },
  methods: {
    toggleIdentifyLedValue(row: { uri: any; identifyLed: any }) {
      this.$store
        .dispatch('chassis/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }: { message: string }) => this.errorToast(message));
    },
    // TO DO: Remove this method when the LocationIndicatorActive is added from backend.
    hasIdentifyLed(identifyLed: any) {
      return typeof identifyLed === 'boolean';
    },
  },
};
</script>
