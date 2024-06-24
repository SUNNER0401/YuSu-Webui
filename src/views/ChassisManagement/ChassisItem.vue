<template>
  <b-col lg="2">
    <b-card class="mb-2">
      <div class="justify-content-between align-items-center d-flex flex-wrap">
        <h3 class="h5 mb-0">{{ title }}</h3>
        <div class="card-buttons">
          <b-link :to="to">{{ $t('pageOverview.viewMore') }}</b-link>
        </div>
      </div>
      <b-row class="mt-3">
        <b-col>
          <dl>
            <dt v-for="(value, key) in data" :key="key">
              {{ key }}: {{ value }}
            </dt>
          </dl>
        </b-col>
      </b-row>
    </b-card>
  </b-col>
</template>

<script>
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'ChassisItem',
  mixins: [DataFormatterMixin],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: '',
    },
  },
  computed: {},
  created() {},
};
</script>

<style lang="scss" scoped>
a {
  vertical-align: middle;
  font-size: 14px;
}
.card {
  min-width: 180px;
}
</style>
