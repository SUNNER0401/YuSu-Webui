<template>
  <page-section :section-title="$t('pageNetwork.ipv4')">
    <b-row>
      <b-col>
        <h3 class="h5">
          {{ $t('pageNetwork.ipv4Addresses') }}
        </h3>
      </b-col>
      <b-col class="text-right">
        <b-button-group>
          <b-button variant="primary" @click="switchToDHCP()">
            <icon-settings />
            {{ $t('pageNetwork.table.switchToDHCP') }}
          </b-button>
          <b-button variant="primary" @click="initAddIpv4Address()">
            <icon-add />
            {{ $t('pageNetwork.table.addIpv4Address') }}
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>
    <b-table
      responsive="md"
      hover
      :fields="ipv4TableFields"
      :items="form.ipv4TableItems"
      :empty-text="$t('global.table.emptyMessage')"
      class="mb-0"
      show-empty
    >
      <template #cell(actions)="{ item, index }">
        <table-row-action
          v-for="(action, actionIndex) in item.actions"
          :key="actionIndex"
          :value="action.value"
          class="tableIpv4-action"
          :title="action.title"
          :enabled="action.enabled"
          @click-table-action="onIpv4TableAction(action, $event, index)"
        >
          <template #icon>
            <icon-edit v-if="action.value === 'edit'" />
            <icon-trashcan
              v-if="
                action.value === 'delete' && form.ipv4TableItems.length == 1
              "
            />
            <icon-trashcan
              v-if="
                action.value === 'delete' && form.ipv4TableItems.length != 1
              "
            />
          </template>
        </table-row-action>
      </template>
    </b-table>
  </page-section>
</template>

<script lang="ts">
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconSettings from '@carbon/icons-vue/es/settings/20';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import PageSection from '@/components/Global/PageSection';
import TableRowAction from '@/components/Global/TableRowAction';
import { mapState } from 'vuex';

export default {
  name: 'Ipv4Table',
  components: {
    IconAdd,
    IconEdit,
    IconTrashcan,
    IconSettings,
    PageSection,
    TableRowAction,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      form: {
        ipv4TableItems: [],
      },
      actions: [
        {
          value: 'edit',
          title: this.$t('global.action.edit'),
        },
        {
          value: 'delete',
          title: this.$t('global.action.delete'),
        },
      ],
      ipv4TableFields: [
        {
          key: 'Address',
          label: this.$t('pageNetwork.table.ipAddress'),
        },
        {
          key: 'Gateway',
          label: this.$t('pageNetwork.table.gateway'),
        },
        {
          key: 'SubnetMask',
          label: this.$t('pageNetwork.table.subnet'),
        },
        {
          key: 'AddressOrigin',
          label: this.$t('pageNetwork.table.addressOrigin'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getIpv4TableItems();
    },
    ethernetData() {
      this.getIpv4TableItems();
    },
    form: {
      handler() {
        if (this.form.ipv4TableItems.length == 1) {
          this.$nextTick(() => {
            const dom = document.querySelector(
              '.tab-pane.active .tableIpv4-action > button'
            );
            if (dom) dom.disabled = true;
          });
        } else {
          this.$nextTick(() => {
            const dom = document.querySelector(
              '.tab-pane.active .tableIpv4-action > button'
            );
            if (dom) dom.disabled = false;
          });
        }
      },
      deep: true,
    },
  },
  created() {
    this.getIpv4TableItems();
    // Emit initial data fetch complete to parent component
    this.$root.$emit('network-table-ipv4-complete');
  },
  methods: {
    getIpv4TableItems() {
      const index = this.tabIndex;
      const addresses = this.ethernetData[index].IPv4Addresses || [];
      this.form.ipv4TableItems = addresses.map(
        (ipv4: {
          Address: any;
          SubnetMask: any;
          Gateway: any;
          AddressOrigin: any;
        }) => {
          return {
            Address: ipv4.Address,
            SubnetMask: ipv4.SubnetMask,
            Gateway: ipv4.Gateway,
            AddressOrigin: ipv4.AddressOrigin,
            actions: [
              {
                value: 'delete',
                title: this.$t('pageNetwork.table.deleteIpv4'),
              },
            ],
          };
        }
      );
    },
    onIpv4TableAction(action: any, $event: string, index: any) {
      if ($event === 'delete') {
        this.deleteIpv4TableRow(index);
      }
    },
    deleteIpv4TableRow(index: any) {
      this.form.ipv4TableItems.splice(index, 1);
      const newIpv4Array = this.form.ipv4TableItems.map(
        (ipv4: { Address: any; SubnetMask: any; Gateway: any }) => {
          const { Address, SubnetMask, Gateway } = ipv4;
          return {
            Address,
            SubnetMask,
            Gateway,
          };
        }
      );
      this.$store
        .dispatch('network/editIpv4Address', newIpv4Array)
        .then((message: any) => this.successToast(message))
        .catch(({ message }: { message: string }) => this.errorToast(message));
    },
    initAddIpv4Address() {
      this.$bvModal.show('modal-add-ipv4');
    },
    switchToDHCP() {
      this.$store
        .dispatch('network/awakeDHCP')
        .then((message: any) => this.successToast(message))
        .catch(({ message }: { message: string }) => this.errorToast(message));
    },
  },
};
</script>
