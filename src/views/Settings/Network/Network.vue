<template>
  <b-container fluid>
    <page-title :description="$t('pageNetwork.pageDescription')" />
    <!-- Global settings for all interfaces -->
    <network-global-settings />
    <!-- Interface tabs -->
    <page-section v-show="ethernetData">
      <b-row>
        <b-col>
          <b-card no-body>
            <b-tabs
              active-nav-item-class="font-weight-bold"
              card
              content-class="mt-3"
            >
              <b-tab
                v-for="(data, index) in ethernetData"
                :key="data.Id"
                :title="data.Id"
                @click="getTabIndex(index)"
              >
                <!-- Interface settings -->
                <network-interface-settings :tab-index="tabIndex" />
                <!-- IPV4 table -->
                <table-ipv-4 :tab-index="tabIndex" />
                <!-- Static DNS table -->
                <table-dns :tab-index="tabIndex" />
              </b-tab>
            </b-tabs>
          </b-card>
        </b-col>
      </b-row>
    </page-section>
    <!-- Modals -->
    <modal-ipv4 :default-gateway="defaultGateway" @ok="saveIpv4Address" />
    <modal-dns @ok="saveDnsAddress" />
    <modal-hostname :hostname="currentHostname" @ok="saveSettings" />
    <modal-mac-address :mac-address="currentMacAddress" @ok="saveSettings" />
  </b-container>
</template>

<script lang="ts">
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import ModalMacAddress from './ModalMacAddress.vue';
import ModalHostname from './ModalHostname.vue';
import ModalIpv4 from './ModalIpv4.vue';
import ModalDns from './ModalDns.vue';
import NetworkGlobalSettings from './NetworkGlobalSettings.vue';
import NetworkInterfaceSettings from './NetworkInterfaceSettings.vue';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import TableIpv4 from './TableIpv4.vue';
import TableDns from './TableDns.vue';
import { mapState } from 'vuex';
import { Route } from 'vue-router';

export default {
  name: 'Network',
  components: {
    ModalHostname,
    ModalMacAddress,
    ModalIpv4,
    ModalDns,
    NetworkGlobalSettings,
    NetworkInterfaceSettings,
    PageSection,
    PageTitle,
    TableDns,
    TableIpv4,
  },
  mixins: [BVToastMixin, DataFormatterMixin, LoadingBarMixin],
  beforeRouteLeave(to: Route, _from: any, next: () => void) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      currentHostname: '',
      currentMacAddress: '',
      defaultGateway: '',
      loading,
      tabIndex: 0,
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  watch: {
    ethernetData() {
      this.getModalInfo();
    },
  },
  created() {
    this.startLoader();
    Promise.all([this.$store.dispatch('network/getEthernetData')]);
    const globalSettings = new Promise<void>((resolve) => {
      this.$root.$on('network-global-settings-complete', () => resolve());
    });
    const interfaceSettings = new Promise<void>((resolve) => {
      this.$root.$on('network-interface-settings-complete', () => resolve());
    });
    const networkTableDns = new Promise<void>((resolve) => {
      this.$root.$on('network-table-dns-complete', () => resolve());
    });
    const networkTableIpv4 = new Promise<void>((resolve) => {
      this.$root.$on('network-table-ipv4-complete', () => resolve());
    });
    // Combine all child component Promises to indicate
    // when page data load complete
    Promise.all([
      globalSettings,
      interfaceSettings,
      networkTableDns,
      networkTableIpv4,
    ]).finally(() => this.endLoader());
  },
  methods: {
    getModalInfo(): void {
      this.defaultGateway = this.$store.getters[
        'network/globalNetworkSettings'
      ][this.tabIndex].defaultGateway;

      this.currentHostname = this.$store.getters[
        'network/globalNetworkSettings'
      ][this.tabIndex].hostname;

      this.currentMacAddress = this.$store.getters[
        'network/globalNetworkSettings'
      ][this.tabIndex].macAddress;
    },
    getTabIndex(selectedIndex: number): void {
      this.tabIndex = selectedIndex;
      this.$store.dispatch('network/setSelectedTabIndex', this.tabIndex);
      this.$store.dispatch(
        'network/setSelectedTabId',
        this.ethernetData[selectedIndex].Id
      );
      this.getModalInfo();
    },
    saveIpv4Address(modalFormData: {
      Address: string;
      Gateway: string;
      SubnetMask: string;
    }): void {
      this.startLoader();
      this.$store
        .dispatch('network/saveIpv4Address', modalFormData)
        .then((message: string) => this.successToast(message))
        .catch(({ message }: { message: string }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    saveDnsAddress(modalFormData: string[]): void {
      this.startLoader();
      this.$store
        .dispatch('network/saveDnsAddress', modalFormData)
        .then((message: string) => this.successToast(message))
        .catch(({ message }: { message: string }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    saveSettings(modalFormData: { MACAddress: string }): void {
      this.startLoader();
      this.$store
        .dispatch('network/saveSettings', modalFormData)
        .then((message: string) => this.successToast(message))
        .catch(({ message }: { message: string }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
