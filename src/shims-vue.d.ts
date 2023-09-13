declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
declare module '*';
interface Element extends VNode {
  disabled?: boolean;
  style?: any;
  blur?: any;
  focus?: any;
}

interface Navigator {
  keyboard?: {
    lock?: () => void;
  };
}

interface AddEventTarget extends EventTarget {
  value: any;
  parentElement?: { [index: string]: any };
  nodeName: string;
  blur: () => void;
  files: { [index: string]: any };
  innerHTML: string;
}
