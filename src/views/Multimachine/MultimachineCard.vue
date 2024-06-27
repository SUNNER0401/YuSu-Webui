<template>
  <b-card bg-variant="light" border-variant="light" class="mb-4 cardcontent">
    <div class="justify-content-between align-items-center d-flex flex-wrap">
      <h3 class="h5 mb-0">{{ title }}</h3>
      <b-link :to="to">{{ $t('pageMultimachine.viewMore') }}</b-link>
    </div>
    <div class="grid">
      <dl v-for="(value, key) in data" :key="key">
        <dt v-if="key === 'warning'">
          <b-badge variant="warning">{{
            $t('pageMultimachine.warning')
          }}</b-badge>
        </dt>
        <dt v-else-if="key === 'error'">
          <b-badge variant="danger">{{ $t('pageMultimachine.error') }}</b-badge>
        </dt>
        <dt v-else>{{ $t(`pageMultimachine.${key}`) }}</dt>
        <!-- <dt>{{ $t(`pageMultimachine.${key}`) }}</dt> -->
        <dd class="griddd">{{ value }}</dd>
      </dl>
    </div>
  </b-card>
</template>
<script>
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
export default {
  name: 'MultimachineCard',
  mixins: [DataFormatterMixin],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: 'Machinetest01',
    },
  },
};
</script>
<style lang="scss" scoped>
a {
  vertical-align: middle;
  font-size: 14px;
}

.card {
  min-width: 258px;
  max-width: 258px;
  margin-right: 20px;
  min-height: 270px;
  // margin-left: 10px;
}
.cardcontent:hover {
  box-shadow: 0 0 20px 2px #919090;
  /*盒子阴影*/
  transition: all 0.7s;
  /*持续时间*/
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 两列，每列占据可用空间的一半 */
  padding-top: 10px;
}
.griddd {
  margin-bottom: -0.5rem;
  margin-left: 0px;
  margin-top: 2px;
}
</style>
