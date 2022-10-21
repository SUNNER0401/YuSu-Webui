export const loading = true;

const LoadingBarMixin = {
  methods: {
    startLoader(): void {
      this.$root.$emit('loader-start');
      this.loading = true;
    },
    endLoader(): void {
      this.$root.$emit('loader-end');
      this.loading = false;
    },
    hideLoader(): void {
      this.$root.$emit('loader-hide');
    },
  },
};

export default LoadingBarMixin;
