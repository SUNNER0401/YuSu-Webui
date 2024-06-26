<template>
  <b-container fluid>
    <page-title :description="$t('pagePowerRestorePolicy.description')" />

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <b-form-group :label="$t('pagePowerRestorePolicy.powerPoliciesLabel')">
          <b-form-radio
            v-for="policy in powerRestorePolicies"
            :key="policy.state"
            v-model="currentPowerRestorePolicy"
            :value="policy.state"
            name="power-restore-policy"
          >
            {{ policy.desc }}
          </b-form-radio>
        </b-form-group>
      </b-col>
    </b-row>

    <b-button variant="primary" type="submit" @click="submitForm">
      {{ $t('global.action.saveSettings') }}
    </b-button>
  </b-container>
</template>

<script lang="ts">
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'PowerRestorePolicy',
  components: { PageTitle },
  mixins: [VuelidateMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to: any, from: any, next: () => void) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      policyValue: null,
    };
  },
  computed: {
    powerRestorePolicies() {
      return this.$store.getters['powerPolicy/powerRestorePolicies'];
    },
    currentPowerRestorePolicy: {
      get() {
        return this.$store.getters['powerPolicy/powerRestoreCurrentPolicy'];
      },
      set(policy: any) {
        this.policyValue = policy;
      },
    },
  },
  created() {
    this.startLoader();
    Promise.all([
      this.$store.dispatch('powerPolicy/getPowerRestorePolicies'),
      this.$store.dispatch('powerPolicy/getPowerRestoreCurrentPolicy'),
    ]).finally(() => this.endLoader());
  },
  methods: {
    submitForm() {
      this.startLoader();
      this.$store
        .dispatch(
          'powerPolicy/setPowerRestorePolicy',
          this.policyValue || this.currentPowerRestorePolicy
        )
        .then((message: string) => this.successToast(message))
        .catch(({ message }: { message: string }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
