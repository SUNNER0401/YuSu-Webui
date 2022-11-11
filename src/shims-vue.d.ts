declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
declare module '*';
interface Element extends VNode {
  disabled?: boolean;
  style?: any;
}

interface Navigator {
  keyboard?: {
    lock?: () => void;
  };
}
