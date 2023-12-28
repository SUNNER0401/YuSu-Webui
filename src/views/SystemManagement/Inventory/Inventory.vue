<template>
  <b-container fluid>
    <page-title />

    <!-- Service indicators -->
    <service-indicator />

    <div>
      <b-card title="Card Title" no-body>
        <b-card-header header-tag="nav">
          <b-nav card-header pills fill>
            <b-nav-item
              v-for="item in links"
              :key="item.id"
              :to="item.path"
              exact
              exact-active-class="active"
            >
              {{ item.linkText }}
            </b-nav-item>
          </b-nav>
        </b-card-header>
        <b-card-body>
          <router-view></router-view>
        </b-card-body>
      </b-card>
    </div>
  </b-container>
</template>

<script lang="ts">
import PageTitle from '@/components/Global/PageTitle';
import ServiceIndicator from './InventoryServiceIndicator';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin';

export default {
  components: {
    PageTitle,
    ServiceIndicator,
  },
  mixins: [LoadingBarMixin, JumpLinkMixin],
  beforeRouteLeave(to: any, from: any, next: () => void) {
    // Hide loader if user navigates away from page
    // before requests complete
    this.hideLoader();
    next();
  },
  data() {
    return {
      links: [
        {
          id: 'system',
          linkText: this.$t('pageInventory.system'),
          path: '/system-management/system-information/system',
        },
        {
          id: 'bmc',
          linkText: this.$t('pageInventory.bmcManager'),
          path: '/system-management/system-information/bmcManager',
        },
        {
          id: 'chassis',
          linkText: this.$t('pageInventory.chassis'),
          path: '/system-management/system-information/chassis',
        },
        {
          id: 'dimms',
          linkText: this.$t('pageInventory.dimmSlot'),
          path: '/system-management/system-information/dimmSlot',
        },
        {
          id: 'fans',
          linkText: this.$t('pageInventory.fans'),
          path: '/system-management/system-information/fans',
        },
        {
          id: 'powerSupply',
          linkText: this.$t('pageInventory.powerSupplies'),
          path: '/system-management/system-information/powerSupplies',
        },
        {
          id: 'processors',
          linkText: this.$t('pageInventory.processors'),
          path: '/system-management/system-information/processors',
        },
        {
          id: 'pci',
          linkText: this.$t('pageInventory.pci'),
          path: '/system-management/system-information/pci',
        },
      ],
    };
  },
};
</script>
