<template>
  <page-section :section-title="$t('pageInventory.pci')">
    <b-table
      sort-icon-left
      no-sort-reset
      hover
      responsive="md"
      show-empty
      :items="items"
      :fields="fields"
      :sort-desc="true"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
    >
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandFans"
          :title="expandRowLabel"
          class="btn-icon-only"
          @click="toggleRowDetails(row)"
        >
          <icon-chevron />
          <span class="sr-only">{{ expandRowLabel }}</span>
        </b-button>
      </template>
      <template #row-details>
        <dl>
          <dd
            v-for="(item, index) in pciDevices"
            :key="index"
            class="section-divider"
          >
            {{ item.PCIInfo }}
          </dd>
        </dl>
      </template>
    </b-table>
  </page-section>
</template>

<script lang="ts">
import PageSection from '@/components/Global/PageSection';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: { IconChevron, PageSection },
  mixins: [TableRowExpandMixin, LoadingBarMixin],
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
          key: 'ID',
        },
      ],
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    pciDevices() {
      return this.$store.getters['pci/pciInfo'];
    },
    items() {
      return [{ ID: this.$t('pageInventory.PCIDevices') }];
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('pci/getPciInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.endLoader();
    });
  },
};
</script>
