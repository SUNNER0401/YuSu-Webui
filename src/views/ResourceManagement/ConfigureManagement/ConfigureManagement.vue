<template>
  <b-container fluid>
    <page-title :description="$t('pageConfigureManagement.description')" />
    <div>
      <b-card no-body>
        <b-tabs card>
          <sensor-tab :sensor-info="sensorInfo"></sensor-tab>
        </b-tabs>
      </b-card>
    </div>
  </b-container>
</template>

<script lang="ts">
import PageTitle from '@/components/Global/PageTitle';
import SensorTab from './SensorTab';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'ConfiureManagement',
  components: { PageTitle, SensorTab },
  mixins: [LoadingBarMixin],
  computed: {
    sensorInfo() {
      return {
        fields: [
          {
            key: 'Name',
            sortable: false,
            label: this.$t('pageConfigureManagement.tabs.tab1.fields.name'),
          },
          {
            key: 'CriticalLow',
            sortable: false,
            label: this.$t(
              'pageConfigureManagement.tabs.tab1.fields.criticalLow'
            ),
          },
          {
            key: 'WarningLow',
            sortable: false,
            label: this.$t(
              'pageConfigureManagement.tabs.tab1.fields.warningLow'
            ),
          },
          {
            key: 'WarningHigh',
            sortable: false,
            label: this.$t(
              'pageConfigureManagement.tabs.tab1.fields.WarningHigh'
            ),
          },
          {
            key: 'CriticalHigh',
            sortable: false,
            label: this.$t(
              'pageConfigureManagement.tabs.tab1.fields.criticalHigh'
            ),
          },
        ],
        items: this.$store.getters['configure/sensorInfo'],
      };
    },
  },
  mounted() {
    this.startLoader();
    this.$store.dispatch('configure/getConfigures').finally(() => {
      this.endLoader();
    });
  },
};
</script>
