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

export default {
  name: 'ConfiureManagement',
  components: { PageTitle, SensorTab },
  computed: {
    sensorInfo() {
      return {
        fields: ['first_name', 'last_name', 'age'],
        items: [
          {
            isActive: true,
            age: 40,
            first_name: 'Dickerson',
            last_name: 'Macdonald',
          },
          { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
          {
            isActive: false,
            age: 89,
            first_name: 'Geneva',
            last_name: 'Wilson',
          },
          { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
        ],
      };
    },
  },
  mounted() {
    this.getConfigures();
  },
  methods: {
    getConfigures() {},
  },
};
</script>
