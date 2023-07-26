<template>
  <b-container fluid>
    <page-title :description="$t('pageFanSpeed.description')" />
    <b-row class="main-row">
      <b-col sm="12" md="12">
        <page-section
          :section-title="$t('pageFanSpeed.currentStatus')"
          class="setting-section"
        >
          <b-row>
            <b-col sm="12" md="12">
              <div class="current-status-background">
                <dl>
                  <dd>
                    <fan-speed-chart :fan-speeds="fanSpeeds" />
                  </dd>
                </dl>
              </div>
            </b-col>
          </b-row>
        </page-section>
        <page-section :section-title="$t('pageFanSpeed.zoneControl')">
          <b-form>
            <div class="form-background pt-4">
              <b-row>
                <b-col>
                  <template v-for="(zoneInfo, index1) in zoneInfos">
                    <b-form
                      :key="index1"
                      class="ml-4 mb-4"
                      @submit="submitSetting(zoneInfo, pwmValues)"
                    >
                      <b-row>
                        <b-col>
                          <b-row>
                            <b-col>
                              <h4>{{ zoneInfo.ZoneName }}</h4>
                              <b-row>
                                <b-col lg="3" xl="2">
                                  <b-form-select
                                    v-model="zoneInfo.Current"
                                    :options="zoneInfo.Supported"
                                    size="sm"
                                    class="mb-3"
                                  >
                                  </b-form-select>
                                </b-col>
                              </b-row>
                            </b-col>
                          </b-row>
                          <!-- These functions only can be used in manual mode. -->
                          <template v-if="zoneInfo.Current === 'MANUAL_MODE'">
                            <div
                              v-for="(tachNames, pwmName) in zoneInfo.FanInfo"
                              :key="pwmName"
                            >
                              <b-row
                                v-for="(tachName, index2) in tachNames"
                                :key="index2"
                                style="width: 500px"
                              >
                                <b-col sm="4" md="4" lg="3" xl="3">
                                  <p>{{ tachName }}</p>
                                </b-col>
                                <b-col sm="4" md="4" lg="3" xl="3">
                                  <b-form-input
                                    v-model="pwmValues[pwmName]"
                                    class="text-center"
                                    type="number"
                                    min="0"
                                    max="100"
                                    :state="
                                      getValidationState($v.pwmValues[pwmName])
                                    "
                                    @blur="$v.pwmValues[pwmName].$touch()"
                                    @focus="$v.pwmValues[pwmName].$reset()"
                                  />
                                  <b-form-invalid-feedback role="alert">
                                    <div v-if="!$v.pwmValues[pwmName].required">
                                      {{ $t('global.form.fieldRequired') }}
                                    </div>
                                    <div
                                      v-else-if="!$v.pwmValues[pwmName].between"
                                    >
                                      {{
                                        $t('global.form.valueMustBeBetween', {
                                          min: 0,
                                          max: 100,
                                        })
                                      }}
                                    </div>
                                  </b-form-invalid-feedback>
                                </b-col>
                              </b-row>
                            </div>
                            <b-row>
                              <b-col>
                                <a
                                  href=""
                                  class="fan-relationship"
                                  @click="showRelationship(zoneInfo, $event)"
                                  >{{ $t('pageFanSpeed.zoneRelationship') }}</a
                                >
                              </b-col>
                            </b-row>
                            <modal-fan-speed-relationship
                              :zone-info="zoneInfo"
                            />
                          </template>
                          <b-row>
                            <b-col>
                              <b-button
                                class="speed-confirm"
                                variant="primary"
                                type="submit"
                                >{{ $t('global.action.save') }}
                              </b-button>
                            </b-col>
                          </b-row>
                        </b-col>
                      </b-row>
                    </b-form>
                  </template>
                </b-col>
              </b-row>
            </div>
          </b-form>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import FanSpeedChart from './FanSpeedChart';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import { mapGetters } from 'vuex';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import { required, between } from 'vuelidate/lib/validators';
import ModalFanSpeedRelationship from './FanSpeedModalRelationship.vue';

export default {
  name: 'FanSpeed',
  components: {
    FanSpeedChart,
    PageTitle,
    PageSection,
    ModalFanSpeedRelationship,
  },
  mixins: [LoadingBarMixin, BVToastMixin, VuelidateMixin],
  // @ts-ignore
  validations() {
    let pwmValues = Object.assign({}, this.pwmValues);
    Object.keys(pwmValues).forEach((fanName) => {
      pwmValues[fanName] = {
        required,
        between: between(0, 100),
      };
    });
    return {
      pwmValues,
    };
  },
  computed: {
    ...mapGetters('fanSpeed', ['fanSpeeds', 'pwmValues', 'zoneInfos']),
  },
  async created(): Promise<void> {
    this.startLoader();
    this.$store.dispatch('fanSpeed/getFanAllData').finally(() => {
      this.endLoader();
    });
  },
  methods: {
    showRelationship(zoneInfo: any, event: any) {
      event.preventDefault();
      this.$bvModal.show('modal-fan-speed-relationship-' + zoneInfo.ZoneName);
    },
    submitSetting(
      zoneInfo: { [index: string]: any },
      pwmValues: { [index: string]: number | string }
    ): void {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      for (let pwmName in pwmValues) {
        if (typeof pwmValues[pwmName] == 'string') {
          pwmValues[pwmName] = parseInt(pwmValues[pwmName] as string);
        }
      }
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageFanSpeed.modal.confirmMessage', {
            zoneName: zoneInfo.ZoneName,
          }),
          {
            title: this.$t('pageFanSpeed.modal.confirmTitle'),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then(async (confirm: boolean) => {
          if (confirm) {
            this.startLoader();
            this.$store
              .dispatch('fanSpeed/manualControl', {
                zoneInfo,
                pwmValues,
              })
              .then(() => {
                // Successfully
                this.successToast(this.$t('pageFanSpeed.toast.successSaving'));
              })
              .catch(() => {
                // Set failed.
                this.errorToast(this.$t('pageFanSpeed.toast.errorSetting'));
              })
              .finally(async () => {
                // After operations get fan data again.
                await this.$store.dispatch('fanSpeed/getFanAllData');
                this.endLoader();
              });
          }
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.setting-section {
  border-bottom: 1px solid gray('300');
}
.current-status-background {
  height: 90%;
  width: 100%;
}
.page-section {
  margin-bottom: $spacer * 1;
}
.speed-confirm {
  height: 32px;
}
::v-deep .form-control {
  height: 26px;
}
.fan-relationship:hover {
  text-decoration: none;
}
</style>
