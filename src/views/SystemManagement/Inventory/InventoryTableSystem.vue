<template>
  <page-section :section-title="$t('pageInventory.system')">
    <b-table
      responsive="md"
      hover
      show-empty
      :items="systems"
      :fields="fields"
      :empty-text="$t('global.table.emptyMessage')"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandSystem"
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

      <template #cell(locationIndicatorActive)="{ item }">
        <b-form-checkbox
          id="identifyLedSwitchSystem"
          v-model="item.locationIndicatorActive"
          data-test-id="inventorySystem-toggle-identifyLed"
          switch
          @change="toggleIdentifyLedSwitch"
        >
          <span v-if="item.locationIndicatorActive">
            {{ $t('global.status.on') }}
          </span>
          <span v-else>{{ $t('global.status.off') }}</span>
        </b-form-checkbox>
      </template>

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Serial number -->
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
                <dd v-if="item.model">{{ dataFormatter(item.model) }}</dd>
                <!-- Asset tag -->
                <dt v-if="item.assetTag">
                  {{ $t('pageInventory.table.assetTag') }}:
                </dt>
                <dd v-if="item.assetTag" class="mb-2">
                  {{ dataFormatter(item.assetTag) }}
                </dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Status state -->
                <dt v-if="item.statusState && item.statusState != 'Disabled'">
                  {{ $t('pageInventory.table.statusState') }}:
                </dt>
                <dd v-if="item.statusState && item.statusState != 'Disabled'">
                  {{ dataFormatter(item.statusState) }}
                </dd>
                <!-- Power state -->
                <dt v-if="item.powerState">
                  {{ $t('pageInventory.table.power') }}:
                </dt>
                <dd v-if="item.powerState">
                  {{ dataFormatter(item.powerState) }}
                </dd>
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
            <b-col class="mt-1" sm="6">
              <dl>
                <!-- Manufacturer -->
                <dt v-if="item.manufacturer">
                  {{ $t('pageInventory.table.manufacturer') }}:
                </dt>
                <dd v-if="item.manufacturer">
                  {{ dataFormatter(item.manufacturer) }}
                </dd>
                <!-- Description -->
                <dt v-if="item.description">
                  {{ $t('pageInventory.table.description') }}:
                </dt>
                <dd v-if="item.description">
                  {{ dataFormatter(item.description) }}
                </dd>
                <!-- Sub Model -->
                <dt v-if="item.subModel">
                  {{ $t('pageInventory.table.subModel') }}:
                </dt>
                <dd v-if="item.subModel">
                  {{ dataFormatter(item.subModel) }}
                </dd>
                <!-- System Type -->
                <dt v-if="item.systemType">
                  {{ $t('pageInventory.table.systemType') }}:
                </dt>
                <dd v-if="item.systemType">
                  {{ dataFormatter(item.systemType) }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <!-- Memory Summary -->
              <p class="mt-1 mb-2 h6 float-none m-0">
                {{ $t('pageInventory.table.memorySummary') }}
              </p>
              <dl class="ml-4">
                <!-- Status state -->
                <dt
                  v-if="
                    item.memorySummaryState &&
                    item.memorySummaryState != 'Disabled'
                  "
                >
                  {{ $t('pageInventory.table.statusState') }}:
                </dt>
                <dd
                  v-if="
                    item.memorySummaryState &&
                    item.memorySummaryState != 'Disabled'
                  "
                >
                  {{ dataFormatter(item.memorySummaryState) }}
                </dd>
                <!-- Health -->
                <dt v-if="item.memorySummaryHealth">
                  {{ $t('pageInventory.table.health') }}:
                </dt>
                <dd v-if="item.memorySummaryHealth">
                  {{ dataFormatter(item.memorySummaryHealth) }}
                </dd>
                <!-- Health Roll  -->
                <dt v-if="item.memorySummaryHealthRollup">
                  {{ $t('pageInventory.table.healthRollup') }}:
                </dt>
                <dd v-if="item.memorySummaryHealthRollup">
                  {{ dataFormatter(item.memorySummaryHealthRollup) }}
                </dd>
              </dl>
              <!-- Processor Summary -->
              <p class="mt-1 mb-2 h6 float-none m-0">
                {{ $t('pageInventory.table.processorSummary') }}
              </p>
              <dl class="ml-4">
                <!-- Status state -->
                <dt
                  v-if="
                    item.processorSummaryState &&
                    item.processorSummaryState != 'Disabled'
                  "
                >
                  {{ $t('pageInventory.table.statusState') }}:
                </dt>
                <dd
                  v-if="
                    item.processorSummaryState &&
                    item.processorSummaryState != 'Disabled'
                  "
                >
                  {{ dataFormatter(item.processorSummaryState) }}
                </dd>
                <!-- Health -->
                <dt v-if="item.processorSummaryHealth">
                  {{ $t('pageInventory.table.health') }}:
                </dt>
                <dd v-if="item.processorSummaryHealth">
                  {{ dataFormatter(item.processorSummaryHealth) }}
                </dd>
                <!-- Health Rollup -->
                <dt v-if="item.processorSummaryHealthRoll">
                  {{ $t('pageInventory.table.healthRollup') }}:
                </dt>
                <dd v-if="item.processorSummaryHealthRoll">
                  {{ dataFormatter(item.processorSummaryHealthRoll) }}
                </dd>
                <!-- Count -->
                <dt v-if="item.processorSummaryCount">
                  {{ $t('pageInventory.table.count') }}:
                </dt>
                <dd v-if="item.processorSummaryCount">
                  {{ dataFormatter(item.processorSummaryCount) }}
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
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import PageSection from '@/components/Global/PageSection';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';

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
          key: 'hardwareType',
          label: this.$t('pageInventory.table.hardwareType'),
          formatter: (this as any).dataFormatter,
          tdClass: 'text-nowrap',
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
          key: 'locationIndicatorActive',
          label: this.$t('pageInventory.table.identifyLed'),
          formatter: (this as any).dataFormatter,
        },
      ],
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    systems() {
      return this.$store.getters['system/systems'];
    },
  },
  created() {
    this.$store.dispatch('system/getSystem').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-system-complete');
    });
  },
  methods: {
    toggleIdentifyLedSwitch(state: any) {
      this.$store
        .dispatch('system/changeIdentifyLedState', state)
        .catch(({ message }: { message: string }) => this.errorToast(message));
    },
  },
};
</script>
