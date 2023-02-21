<template>
  <b-form @submit.prevent="submit">
    <b-tab
      id="Sensor"
      ref="Sensor"
      :title="$t('pageConfigureManagement.tabs.tab1.name')"
      active
    >
      <div>
        <b-table striped hover :items="info.items" :fields="info.fields">
          <template
            v-for="(field, field_index) in info.fields"
            :slot="`cell(${field.key})`"
            slot-scope="{ item, index }"
          >
            <div :id="`row${index}-${field.key}`" :key="field_index">
              <div class="watch-field">
                <span>{{ dataFormatter(item[field.key]) }}</span>
                <!-- Except 'Name' field -->
                <span
                  v-if="
                    item[field.key] != undefined &&
                    field.key != 'Name' &&
                    item.Unit
                  "
                  >{{ unitFormatter(item.Unit) }}</span
                >
                <span>{{ ' ' }}</span>
                <b-icon
                  v-if="field.key != 'Name' && item[field.key] != undefined"
                  icon="pencil"
                  variant="primary"
                  style="cursor: pointer"
                  @click="edit"
                ></b-icon>
              </div>
              <div v-if="item[field.key] != undefined" class="edit-field">
                <b-form-input
                  type="text"
                  :value="info.items[index][field.key]"
                  required
                  @keypress.enter.prevent=""
                  @keyup.enter.self="blur"
                  @blur="editComplete"
                />
                <span v-if="item.Unit">{{ unitFormatter(item.Unit) }}</span>
              </div>
            </div>
          </template>
        </b-table>
      </div>
      <b-button variant="primary" type="submit" :disabled="disabledController">
        {{ $t('global.action.saveSettings') }}
      </b-button>
    </b-tab>
  </b-form>
</template>

<script lang="ts">
import { AddEventTarget } from '@/env.d.ts';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'SensorTab',
  mixins: [DataFormatterMixin, BVToastMixin],
  props: {
    sensorInfo: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      edittingCount: 0,
    };
  },
  computed: {
    info: {
      get() {
        return this.sensorInfo;
      },
    },
    diffList: {
      get() {
        return [];
      },
    },
    disabledController() {
      return this.edittingCount > 0 ? true : false;
    },
  },
  methods: {
    blur(e: Event) {
      (e.target as AddEventTarget)!.blur();
    },
    edit(e: Event) {
      this.edittingCount++;
      // To catch editting field
      let parentDOM;
      if ((e!.target as AddEventTarget).nodeName == 'svg') {
        parentDOM = (e!.target as AddEventTarget)!.parentElement!.parentElement;
      } else {
        parentDOM = (e!.target as AddEventTarget)!.parentElement!.parentElement!
          .parentElement!.parentElement;
      }

      let [row, field] = parentDOM.id.split('-');
      row = row.split('row')[1];

      parentDOM.classList.add('editting');
      let inputDom = document.querySelector(
        `#row${row}-${field} input`
      ) as Element;

      this.$nextTick(() => {
        inputDom.focus();
      });
    },
    editComplete(e: Event) {
      this.edittingCount--;
      let dom = (e!.target as AddEventTarget)!.parentElement!.parentElement;
      let [row, field] = dom.id.split('-');
      row = row.split('row')[1];

      let value = (e!.target as AddEventTarget).value as any;
      if (!value) {
        alert(this.$t('pageConfigureManagement.tabs.tab1.modal.errorNull'));
        return;
      } else {
        if (field != 'Name') {
          if (isNaN(value) || value < 0) {
            alert(
              this.$t('pageConfigureManagement.tabs.tab1.modal.errorBadValue')
            );
            return;
          }
          value = +value;
        }
      }

      dom.classList.remove('editting');
      this.info.items[row][field] = value;
      let diffRow: { [index: string]: any } = {};

      // Catch each field name for this.info.fields.
      for (field of this.info.fields) {
        diffRow[field.key] = this.info.items[row][field.key];
      }
      diffRow['Unit'] = this.info.items[row].Unit;
      this.diffList.push(diffRow);
      let tmp = this._.uniqWith(this.diffList, this._.isEqual);
      this.diffList.splice(0, this.diffList.length);
      Object.assign(this.diffList, tmp);
    },
    async submit() {
      this.$bvModal
        .msgBoxConfirm(
          this.$tc('pageConfigureManagement.tabs.tab1.modal.confirmSubmit'),
          {
            title: this.$tc(
              'pageConfigureManagement.tabs.tab1.modal.confirmSubmitTitle'
            ),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then(async (Confirmed: boolean) => {
          if (Confirmed) {
            await this.$store
              .dispatch('configure/UpdateSensorConfigure', this.diffList)
              .then(() => {
                this.successToast(
                  this.$t(
                    'pageConfigureManagement.tabs.tab1.toast.successUpdate'
                  )
                );
              })
              .catch(() => {
                this.errorToast(
                  this.$t('pageConfigureManagement.tabs.tab1.modal.errorUpdate')
                );
              });
          }
        });
    },
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

input[type='text'] {
  display: inline;
  max-width: 90px;
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
