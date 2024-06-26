<template>
  <page-section :section-title="$t('pageInventory.bmcManager')">
    <b-table
      responsive="md"
      hover
      :items="items"
      :fields="fields"
      show-empty
      :empty-text="$t('global.table.emptyMessage')"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandBmc"
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
                <dt>{{ $t('pageInventory.table.name') }}:</dt>
                <dd>{{ dataFormatter(item.name) }}</dd>
                <!-- Part number -->
                <dt>{{ $t('pageInventory.table.partNumber') }}:</dt>
                <dd>{{ dataFormatter(item.partNumber) }}</dd>
                <!-- Serial number -->
                <dt>{{ $t('pageInventory.table.serialNumber') }}:</dt>
                <dd>{{ dataFormatter(item.serialNumber) }}</dd>
                <!-- Spare part number -->
                <dt v-if="item.sparePartNumber">
                  {{ $t('pageInventory.table.sparePartNumber') }}:
                </dt>
                <dd v-if="item.sparePartNumber">
                  {{ dataFormatter(item.sparePartNumber) }}
                </dd>
                <!-- Model -->
                <dt>{{ $t('pageInventory.table.model') }}:</dt>
                <dd>{{ dataFormatter(item.model) }}</dd>
                <!-- UUID -->
                <dt v-if="item.uuid">{{ $t('pageInventory.table.uuid') }}:</dt>
                <dd v-if="item.uuid">{{ dataFormatter(item.uuid) }}</dd>
                <!-- Service entry point UUID -->
                <dt>{{ $t('pageInventory.table.serviceEntryPointUuid') }}:</dt>
                <dd>{{ dataFormatter(item.serviceEntryPointUuid) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                <dd>{{ dataFormatter(item.statusState) }}</dd>
                <!-- Power state -->
                <dt>{{ $t('pageInventory.table.power') }}:</dt>
                <dd>{{ dataFormatter(item.powerState) }}</dd>
                <!-- Health rollup -->
                <dt>{{ $t('pageInventory.table.healthRollup') }}:</dt>
                <dd>{{ dataFormatter(item.healthRollup) }}</dd>
                <!-- BMC date and time -->
                <dt>{{ $t('pageInventory.table.bmcDateTime') }}:</dt>
                <dd>
                  {{ item.dateTime | formatDate }}
                  {{ item.dateTime | formatTime }}
                </dd>
                <!-- Reset date and time -->
                <dt>{{ $t('pageInventory.table.lastResetTime') }}:</dt>
                <dd>
                  {{ item.lastResetTime | formatDate }}
                  {{ item.lastResetTime | formatTime }}
                </dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col class="mt-2" sm="6" xl="6">
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
                <!-- Manager type -->
                <dt v-if="item.managerType">
                  {{ $t('pageInventory.table.managerType') }}:
                </dt>
                <dd v-if="item.managerType">
                  {{ dataFormatter(item.managerType) }}
                </dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <!-- Firmware Version  -->
              <dl>
                <dt v-if="item.firmwareVersion">
                  {{ $t('pageInventory.table.firmwareVersion') }}:
                </dt>
                <dd v-if="item.firmwareVersion">{{ item.firmwareVersion }}</dd>
              </dl>
              <!-- Graphical console -->
              <p class="mt-1 mb-2 h6 float-none m-0">
                {{ $t('pageInventory.table.graphicalConsole') }}
              </p>
              <dl class="ml-4">
                <dt v-if="item.graphicalConsoleConnectTypes">
                  {{ $t('pageInventory.table.connectTypesSupported') }}:
                </dt>
                <dd v-if="item.graphicalConsoleConnectTypes">
                  {{ dataFormatterArray(item.graphicalConsoleConnectTypes) }}
                </dd>
                <dt v-if="item.graphicalConsoleMaxSessions">
                  {{ $t('pageInventory.table.maxConcurrentSessions') }}:
                </dt>
                <dd v-if="item.graphicalConsoleMaxSessions">
                  {{ dataFormatter(item.graphicalConsoleMaxSessions) }}
                </dd>
                <dt v-if="item.graphicalConsoleEnabled">
                  {{ $t('pageInventory.table.serviceEnabled') }}:
                </dt>
                <dd v-if="item.graphicalConsoleEnabled">
                  {{ dataFormatter(item.graphicalConsoleEnabled) }}
                </dd>
              </dl>
              <!-- Serial console -->
              <p class="mt-1 mb-2 h6 float-none m-0">
                {{ $t('pageInventory.table.serialConsole') }}
              </p>
              <dl class="ml-4">
                <dt v-if="item.serialConsoleConnectTypes">
                  {{ $t('pageInventory.table.connectTypesSupported') }}:
                </dt>
                <dd v-if="item.serialConsoleConnectTypes">
                  {{ dataFormatterArray(item.serialConsoleConnectTypes) }}
                </dd>
                <dt v-if="item.serialConsoleMaxSessions">
                  {{ $t('pageInventory.table.maxConcurrentSessions') }}:
                </dt>
                <dd v-if="item.serialConsoleMaxSessions">
                  {{ dataFormatter(item.serialConsoleMaxSessions) }}
                </dd>
                <dt v-if="item.serialConsoleEnabled">
                  {{ $t('pageInventory.table.serviceEnabled') }}:
                </dt>
                <dd v-if="item.serialConsoleEnabled">
                  {{ dataFormatter(item.serialConsoleEnabled) }}
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
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon },
  mixins: [
    BVToastMixin,
    TableRowExpandMixin,
    DataFormatterMixin,
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
    bmc() {
      return this.$store.getters['bmc/bmc'];
    },
    items() {
      if (this.bmc) {
        return [this.bmc];
      } else {
        return [];
      }
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('bmc/getBmcInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.endLoader();
    });
  },
  methods: {
    toggleIdentifyLedValue(row: { uri: any; identifyLed: any }) {
      this.$store
        .dispatch('bmc/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }: { message: string }) => this.errorToast(message));
    },
    // TO DO: remove hasIdentifyLed method once the following story is merged:
    // https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/43179
    hasIdentifyLed(identifyLed: any) {
      return typeof identifyLed === 'boolean';
    },
  },
};
</script>
