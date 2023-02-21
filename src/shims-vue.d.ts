declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
declare module '*';
interface Element extends VNode {
  disabled?: boolean;
  style?: any;
  blur?: any;
}

interface Navigator {
  keyboard?: {
    lock?: () => void;
  };
}

interface AddEventTarget extends EventTarget {
  value: any;
  parentElement?: { [index: string]: any };
}
