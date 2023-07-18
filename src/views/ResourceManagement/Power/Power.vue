<template>
  <b-container fluid>
    <page-title :description="$t('pagePower.description')" />

    <b-row>
      <b-col>
        <b-row>
          <b-col class="pr-0" sm="1" md="1" xl="1">
            <b-button-group>
              <b-row xl="6">
                <b-col>
                  <b-button
                    class="switch-chart"
                    variant="primary"
                    :pressed="btnState && !historyChart"
                    :disabled="!btnState"
                    @click="switchChart"
                    >{{ $t('pagePower.buttons.button1') }}</b-button
                  >
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-button
                    class="switch-chart"
                    :pressed="btnState && historyChart"
                    variant="primary"
                    :disabled="!btnState"
                    @click="switchChart"
                    >{{ $t('pagePower.buttons.button2') }}</b-button
                  >
                </b-col>
              </b-row>
            </b-button-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="pl-0 chart-container-col" cols="12">
            <div class="chart-container-background">
              <div class="chart-container" :class="{ history: historyChart }">
                <div class="front-container">
                  <power-chart-1
                    class="front"
                    :power-consumption-value="+powerConsumptionValue"
                  />
                </div>
                <div class="back-container">
                  <power-chart-2
                    class="back"
                    :power-consumption-value="+powerConsumptionValue"
                  />
                </div>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <power-tabs :power-consumption-value="+powerConsumptionValue" />
  </b-container>
</template>

<script lang="ts">
import PageTitle from '@/components/Global/PageTitle';
import PowerChart1 from './PowerChart1';
import PowerChart2 from './PowerChart2';
import PowerTabs from './PowerTabs';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { requiredIf, between } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';

export default {
  name: 'Power',
  components: { PageTitle, PowerChart1, PowerChart2, PowerTabs },
  mixins: [VuelidateMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to: any, from: any, next: () => void) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      historyChart: false,
      loading,
      btnState: false,
    };
  },
  computed: {
    ...mapGetters({
      powerConsumptionValue: 'powerControl/powerConsumptionValue',
    }),

    /**
      Computed property isPowerCapFieldEnabled is used to enable or disable the input field.
      The input field is enabled when the powercapValue property is not null.
   **/
    isPowerCapFieldEnabled: {
      get() {
        return this.powerCapValue !== null;
      },
      set(value: number) {
        let newValue = value ? '' : null;
        this.$v.$reset();
        this.$store.dispatch('powerControl/setPowerCapUpdatedValue', newValue);
      },
    },
    powerCapValue: {
      get() {
        return this.$store.getters['powerControl/powerCapValue'];
      },
      set(value: number) {
        this.$v.$touch();
        this.$store.dispatch('powerControl/setPowerCapUpdatedValue', value);
      },
    },
  },
  async created() {
    this.startLoader();
    await this.$store.dispatch('powerControl/getPowerChassisId');
    await this.$store.dispatch('powerControl/getPowerControl').then(() => {
      this.$store.commit('powerControl/setpowerChartData1');
    });
    this.$store.dispatch('powerControl/getReadingRangeMax').then(() => {
      this.$root.$emit('getRealTimeData-complete');
    });
    this.$store.dispatch('powerControl/getHistoryInfo').then(() => {
      this.$root.$emit('getHistoryInfo-complete');
    });
    this.$store.dispatch('powerControl/getPowerControl').finally(() => {
      this.btnState = true;
      this.endLoader();
    });
  },
  // @ts-ignore
  validations: {
    powerCapValue: {
      between: between(1, 10000),
      required: requiredIf(function () {
        return this.isPowerCapFieldEnabled;
      }),
    },
  },
  methods: {
    switchChart() {
      this.historyChart = !this.historyChart;
    },
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();
      this.$store
        .dispatch('powerControl/setPowerControl', this.powerCapValue)
        .then((message: string) => this.successToast(message))
        .catch(({ message }: { message: string }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>

<style lang="scss" scoped>
.switch-chart {
  width: 100px;
}
.switch-chart.active {
  background-color: #03e7dca3 !important;
}

$power-chart-height: 400px;

.chart-container-col {
  perspective: 4000px;
  .chart-container-background {
    position: relative;
    background-color: transparent;
    left: 15px;
    width: calc(100% - 15px);
  }
  .chart-container {
    position: relative;
    width: 100%;
    transition: all 0.5s;
    transform-style: preserve-3d;
    &.history {
      transform: rotateY(180deg);
      .front-container {
        z-index: -1;
      }
    }
    height: $power-chart-height;
    .front-container,
    .back-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: $power-chart-height;
      background: linear-gradient(138deg, #f4f5fb6b, #03d1ff3d);
      backface-visibility: hidden;
    }
    .back-container {
      transform: rotateY(180deg);
    }
  }
}
</style>
