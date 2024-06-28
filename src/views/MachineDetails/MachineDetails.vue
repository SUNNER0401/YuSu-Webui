<template>
  <b-container fluid>
    <page-title />
    <div>
      <ul class="nav nav-tabs" role="tablist">
        <li
          v-for="(tab, index) in tabs"
          :key="index"
          class="nav-item"
          :class="{ active: currentTab === tab.id }"
        >
          <a
            class="nav-link"
            :href="'#' + tab.id"
            role="tab"
            data-toggle="tab"
            @click.prevent="changeTab(tab.id)"
          >
            {{ tab.title }}
          </a>
        </li>
      </ul>

      <div class="tab-content">
        <div
          v-for="(tab, index) in tabs"
          :id="tab.id"
          :key="index"
          class="tab-pane fade"
          :class="{ 'show active': currentTab === tab.id, fade: true }"
        >
          <p>{{ tab.content }}</p>
        </div>
      </div>
    </div>
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
export default {
  name: 'MachinedDetails',
  components: {
    PageTitle,
  },
  mixins: [LoadingBarMixin],
  data() {
    return {
      currentTab: 'tab1',
      tabs: [
        {
          id: 'tab1',
          title: '页面1',
          content: 'slahlkasdfnak',
        },
        {
          id: 'tab2',
          title: '页面2',
          content: 'lalallala',
        },
      ],
    };
  },
  methods: {
    changeTab(tabId) {
      this.currentTab = tabId;
    },
  },
};
</script>
<style>
.nav-item {
  background-color: aliceblue;
}
.tab-pane fade {
  background-color: antiquewhite;
}
</style>
