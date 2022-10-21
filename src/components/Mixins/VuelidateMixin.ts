const VuelidateMixin = {
  methods: {
    getValidationState(model: { $dirty: any; $error: any }) {
      const { $dirty, $error } = model;
      return $dirty ? !$error : null;
    },
  },
};

export default VuelidateMixin;
