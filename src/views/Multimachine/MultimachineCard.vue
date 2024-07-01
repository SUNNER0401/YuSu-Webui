<template>
  <b-card bg-variant="light" border-variant="light" class="mb-4 cardcontent">
    <div class="justify-content-between align-items-center d-flex flex-wrap">
      <h3 class="h5 mb-0" style="font-size: 20px">{{ title }}</h3>
      <b-link
        :to="{
          name: 'machinedetails',
          params: { currentTitle: title },
        }"
        >{{ $t('pageMultimachine.viewMore') }}</b-link
      >
    </div>
    <div class="grid">
      <dl v-for="(value, key) in data" :key="key" style="margin-bottom: 0.5rem">
        <dt style="font-size: 15px">
          <!-- <template
            v-if="
              (key.toLowerCase() === 'warning' && value === 0) ||
              (key.toLowerCase() === 'error' && value === 0)
            "
          >
            {{ $t(`pageMultimachine.${key}`) }}
          </template> -->
          <template
            v-if="
              (key === 'warning' && value === 0) ||
              (key === 'error' && value === 0)
            "
          >
            {{ $t(`pageMultimachine.${key}`) }}
          </template>
          <template v-else-if="key === 'warning' && value != 0">
            <div class="reminder">
              <b-badge variant="warning">{{
                $t('pageMultimachine.warning')
              }}</b-badge>
            </div>
          </template>
          <template v-else-if="key === 'error' && value != 0">
            <div class="reminder">
              <b-badge variant="danger">{{
                $t('pageMultimachine.error')
              }}</b-badge>
            </div>
          </template>
          <template v-else>
            {{ $t(`pageMultimachine.${key}`) }}
          </template>
        </dt>
        <dd>
          <template
            v-if="
              (key === 'warning' && value === 0) ||
              (key === 'error' && value === 0)
            "
          >
            {{ value }}
          </template>
          <template v-else-if="key === 'warning' && value != 0">
            <span class="warning-data">{{ value }}</span>
          </template>
          <template v-else-if="key === 'error' && value != 0">
            <span class="error-data">{{ value }}</span>
          </template>
          <template v-else>
            {{ value }}
          </template>
        </dd>
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
    to: {
      type: String,
      default: '/machinedetails',
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
  border-radius: 10px;
}
.cardcontent {
  transition: all 0.7s ease;
}
.cardcontent:hover {
  transition: all 0.7s;
  /*持续时间*/
  transform: scale(1.05);
  /* 放大1.05倍 */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
  /* 添加阴影 */
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
.warning-data {
  font-size: 18px;
  color: orange;
  font-weight: 600;
}
.error-data {
  font-size: 18px;
  color: red;
  font-weight: 600;
}
.card-body {
  padding-bottom: 10px;
  border-radius: 10px;
}
.reminder {
  font-size: 15px;
}
</style>
