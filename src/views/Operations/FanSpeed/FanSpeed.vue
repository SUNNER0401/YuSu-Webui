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
          <b-form @submit.prevent="setFanMode(selected)">
            <div class="form-background pt-4">
              <b-row>
                <b-col sm="6" md="6">
                  <template v-for="(zoneInfo, index1) in allInfo">
                    <b-form
                      :key="index1"
                      class="ml-4 mb-4"
                      @submit="submitSetting(zoneInfo.Zone)"
                    >
                      <b-row>
                        <b-col>
                          <b-row>
                            <b-col>
                              <h4>{{ 'zone' + zoneInfo.Zone }}</h4>
                              <b-row>
                                <b-col xl="5">
                                  <b-form-select
                                    v-model="zoneInfo.CurrentMode"
                                    :options="allModes"
                                    size="sm"
                                    class="mb-3"
                                  >
                                  </b-form-select>
                                </b-col>
                              </b-row>
                            </b-col>
                          </b-row>
                          <!-- These functions only can be used in manual mode. -->
                          <template
                            v-if="zoneInfo.CurrentMode === 'MANUAL_MODE'"
                          >
                            <b-row
                              v-for="(fan, index2) in zoneInfo.fanInfo"
                              :key="index2"
                            >
                              <b-col cols="3">
                                <p>{{ fan.Name }}</p>
                              </b-col>
                              <b-col cols="3">
                                <b-form-input
                                  v-model="pwmValues[fan.Name]"
                                  class="text-center"
                                  type="number"
                                  min="0"
                                  max="100"
                                  :state="
                                    getValidationState($v.pwmValues[fan.Name])
                                  "
                                  @blur="$v.pwmValues[fan.Name].$touch()"
                                  @focus="$v.pwmValues[fan.Name].$reset()"
                                />
                                <b-form-invalid-feedback role="alert">
                                  <div v-if="!$v.pwmValues[fan.Name].required">
                                    {{ $t('global.form.fieldRequired') }}
                                  </div>
                                  <div
                                    v-else-if="!$v.pwmValues[fan.Name].between"
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

export default {
  name: 'FanSpeed',
  components: {
    FanSpeedChart,
    PageTitle,
    PageSection,
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
    ...mapGetters('fanSpeed', [
      'fanSpeeds',
      'fanUrls',
      'fanModes',
      'pwmRelation',
      'pwmValues',
      'allInfo',
      'allModes',
    ]),
  },
  async created(): Promise<void> {
    this.startLoader();
    this.$store.dispatch('fanSpeed/getAllModes');
    this.$store.dispatch('fanSpeed/getFanAllData').finally(() => {
      this.endLoader();
    });
  },
  methods: {
    submitSetting(zone: number): void {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      let mode: string = this.allInfo[zone - 1].CurrentMode;
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageFanSpeed.modal.confirmMessage', {
            zoneName: 'zone' + zone,
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
            // Set zone mode.
            let isSetMode = false;
            this.$store
              .dispatch('fanSpeed/setFanMode', {
                zone,
                mode,
              })
              .then(async () => {
                isSetMode = true;
                //Judge mode.
                if (mode != 'MANUAL_MODE') return;
                // Batch send setPwmValue requests.
                let promises: Promise<void>[] = [];
                this.allInfo[zone - 1].fanInfo.forEach(
                  ({ Name }: { Name: string; Pwm: number }) => {
                    let promise = this.$store.dispatch('fanSpeed/setPwmValue', {
                      zone,
                      fanName: Name,
                      pwm: this.pwmValues[Name],
                    });
                    promises.push(promise);
                  }
                );
                // Wait all requests complete.
                await Promise.all(promises);
              })
              .then(() => {
                // Successfully
                this.successToast(this.$t('pageFanSpeed.toast.successSaving'));
              })
              .catch(() => {
                if (isSetMode)
                  // Set zone mode failed.
                  this.errorToast(
                    this.$t('pageFanSpeed.toast.errorSettingZoneMode')
                  );
                // Set zone mode successfully but pwm values failed.
                else
                  this.errorToast(
                    this.$t('pageFanSpeed.toast.errorSettingFanPwm')
                  );
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
</style>
