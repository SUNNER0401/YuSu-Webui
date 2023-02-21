<template>
  <b-form @submit.prevent="submit">
    <b-tab
      id="Sensor"
      ref="Sensor"
      :title="$t('pageConfigureManagement.tabs.tab1.name')"
      active
    >
      <div>
        <b-table
          striped
          hover
          :items="sensorInfo.items"
          :fields="sensorInfo.fields"
        >
          <template
            v-for="(field, field_index) in sensorInfo.fields"
            :slot="`cell(${field})`"
            slot-scope="{ item, index }"
          >
            <div :key="field_index">
              <div class="watch-field">
                <span>{{ item[field] + '  ' }}</span>
                <b-icon
                  :id="`icon-tab1-${index}-${field}`"
                  icon="pencil"
                  variant="primary"
                  style="cursor: pointer"
                  @click="edit"
                ></b-icon>
              </div>
              <div class="edit-field">
                <input type="text" @keyup.enter="editComplete" />
              </div>
            </div>
          </template>
        </b-table>
      </div>
      <b-button variant="primary" type="submit">
        {{ $t('global.action.saveSettings') }}
      </b-button>
    </b-tab>
  </b-form>
</template>

<script lang="ts">
import { AddEventTarget } from '@/env.d.ts';

export default {
  name: 'SensorTab1',
  props: {
    sensorInfo: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    edit(e: Event) {
      // To catch editting field
      let dom = (e!.target as AddEventTarget)!.parentElement!.parentElement;
      dom.classList.add('editting');
    },
    editComplete(e: Event) {
      let dom = (e!.target as AddEventTarget)!.parentElement!.parentElement;
      dom.classList.remove('editting');
      console.dir((e!.target as AddEventTarget).test);
    },
    submit() {},
  },
};
</script>

<style scoped lang="scss">
button[type='submit'] {
  position: relative;
  width: 20%;
  left: 50%;
  transform: translateX(-50%);
}

#Sensor {
  position: relative;
  .watch-field {
    display: block;
  }
  .edit-field {
    display: none;
  }
  .editting {
    .watch-field {
      display: none;
    }
    .edit-field {
      display: block;
    }
  }
}
</style>
