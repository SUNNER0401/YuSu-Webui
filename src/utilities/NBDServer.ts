/* handshake flags */
const NBD_FLAG_FIXED_NEWSTYLE = 0x1;
const NBD_FLAG_NO_ZEROES = 0x2;

/* transmission flags */
const NBD_FLAG_HAS_FLAGS = 0x1;
const NBD_FLAG_READ_ONLY = 0x2;

/* option negotiation */
const NBD_OPT_EXPORT_NAME = 0x1;
const NBD_REP_FLAG_ERROR = 0x1 << 31;
const NBD_REP_ERR_UNSUP = NBD_REP_FLAG_ERROR | 1;

/* command definitions */
const NBD_CMD_READ = 0;
const NBD_CMD_WRITE = 1;
const NBD_CMD_DISC = 2;
const NBD_CMD_TRIM = 4;

/* errno */
const EPERM = 1;
const EIO = 5;
const EINVAL = 22;
const ENOSPC = 28;

/* internal object state */
const NBD_STATE_UNKNOWN = 1;
const NBD_STATE_OPEN = 2;
const NBD_STATE_WAIT_CFLAGS = 3;
const NBD_STATE_WAIT_OPTION = 4;
const NBD_STATE_TRANSMISSION = 5;

export default class NBDServer {
  socketStarted: () => void;
  socketClosed: (code: number) => void;
  errorReadingFile: () => void;
  file: { size: number };
  id: any;
  endpoint: string;
  ws: null;
  state: number;
  msgbuf: null;
  stop: () => void;
  private _on_ws_error: (ev: any) => void;
  private _on_ws_close: (ev: any) => void;
  private _on_ws_open: () => void;
  private _on_ws_message: (ev: any) => void;
  private _negotiate: () => void;
  private _handle_cflags: (buf: ArrayBufferLike) => 0 | 4;
  private _handle_option: (buf: ArrayBufferLike) => number;
  private _create_cmd_response: (req: any, rc: any, data?: null) => ArrayBuffer;
  private _handle_cmd: (buf: ArrayBufferLike) => number;
  private _handle_cmd_read: (req: {
    offset_msB: number;
    offset_lsB: number;
    length: any;
  }) => 0 | 28;
  private _handle_cmd_disconnect: () => number;
  recv_handlers: Readonly<{
    3: (buf: ArrayBufferLike) => 0 | 4;
    4: (buf: ArrayBufferLike) => number;
    5: (buf: ArrayBufferLike) => number;
  }>;
  start: () => void;
  constructor(
    endpoint: string,
    file: { size: number },
    id: any,
    token: string
  ) {
    this.socketStarted = () => {};
    this.socketClosed = () => {};
    this.errorReadingFile = () => {};
    this.file = file;
    this.id = id;
    this.endpoint = endpoint;
    this.ws = null;
    this.state = NBD_STATE_UNKNOWN;
    this.msgbuf = null;
    this.start = function () {
      this.ws = new WebSocket(this.endpoint, [token]);
      this.state = NBD_STATE_OPEN;
      this.ws.binaryType = 'arraybuffer';
      this.ws.onmessage = this._on_ws_message.bind(this);
      this.ws.onopen = this._on_ws_open.bind(this);
      this.ws.onclose = this._on_ws_close.bind(this);
      this.ws.onerror = this._on_ws_error.bind(this);
      this.socketStarted();
    };
    this.stop = function () {
      if (this.ws.readyState == 1) {
        this.ws.close();
        this.state = NBD_STATE_UNKNOWN;
      }
    };
    this._on_ws_error = function (ev) {
      console.log(`${endpoint} error: ${ev.error}`);
      console.log(JSON.stringify(ev));
    };
    this._on_ws_close = function (ev) {
      console.log(
        `${endpoint} closed with code: ${ev.code} + reason: ${ev.reason}`
      );
      console.log(JSON.stringify(ev));
      this.socketClosed(ev.code);
    };
    /* websocket event handlers */
    this._on_ws_open = function () {
      console.log(endpoint + ' opened');
      this.client = {
        flags: 0,
      };
      this._negotiate();
    };
    this._on_ws_message = function (ev) {
      let data = ev.data;
      if (this.msgbuf == null) {
        this.msgbuf = data;
      } else {
        const tmp = new Uint8Array(this.msgbuf.byteLength + data.byteLength);
        tmp.set(new Uint8Array(this.msgbuf), 0);
        tmp.set(new Uint8Array(data), this.msgbuf.byteLength);
        this.msgbuf = tmp.buffer;
      }
      for (;;) {
        let handler = this.recv_handlers[this.state];
        if (!handler) {
          console.log('no handler for state ' + this.state);
          this.stop();
          break;
        }
        let consumed = handler(this.msgbuf);
        if (consumed < 0) {
          console.log(
            'handler[state=' + this.state + '] returned error ' + consumed
          );
          this.stop();
          break;
        }
        if (consumed == 0) {
          break;
        }
        if (consumed > 0) {
          if (consumed == this.msgbuf.byteLength) {
            this.msgbuf = null;
            break;
          }
          this.msgbuf = this.msgbuf.slice(consumed);
        }
      }
    };
    this._negotiate = function () {
      let buf = new ArrayBuffer(18);
      let data = new DataView(buf, 0, 18);
      /* NBD magic: NBDMAGIC */
      data.setUint32(0, 0x4e42444d);
      data.setUint32(4, 0x41474943);
      /* newstyle negotiation: IHAVEOPT */
      data.setUint32(8, 0x49484156);
      data.setUint32(12, 0x454f5054);
      /* flags: fixed newstyle negotiation, no padding */
      data.setUint16(16, NBD_FLAG_FIXED_NEWSTYLE | NBD_FLAG_NO_ZEROES);
      this.state = NBD_STATE_WAIT_CFLAGS;
      this.ws.send(buf);
    };
    /* handlers */
    this._handle_cflags = function (buf: ArrayBufferLike) {
      if (buf.byteLength < 4) {
        return 0;
      }
      let data = new DataView(buf, 0, 4);
      this.client.flags = data.getUint32(0);
      this.state = NBD_STATE_WAIT_OPTION;
      return 4;
    };
    this._handle_option = function (buf: ArrayBufferLike) {
      if (buf.byteLength < 16) return 0;
      let data = new DataView(buf, 0, 16);
      if (data.getUint32(0) != 0x49484156 || data.getUint32(4) != 0x454f5054) {
        console.log('invalid option magic');
        return -1;
      }
      let opt = data.getUint32(8);
      let len = data.getUint32(12);
      if (buf.byteLength < 16 + len) {
        return 0;
      }

      let n = 10;
      let resp = new ArrayBuffer(n);
      let view = new DataView(resp, 0, 10);
      let size = this.file.size;
      let resp1 = new ArrayBuffer(20);
      let view1 = new DataView(resp1, 0, 20);
      switch (opt) {
        case NBD_OPT_EXPORT_NAME:
          if (!(this.client.flags & NBD_FLAG_NO_ZEROES)) n += 124;
          /* export size. */

          // eslint-disable-next-line prettier/prettier
          view.setUint32(0, Math.floor(size / (2 ** 32)));
          view.setUint32(4, size & 0xffffffff);
          /* transmission flags: read-only */
          view.setUint16(8, NBD_FLAG_HAS_FLAGS | NBD_FLAG_READ_ONLY);
          this.ws.send(resp);
          this.state = NBD_STATE_TRANSMISSION;
          break;
        default:
          console.log('handle_option: Unsupported option: ' + opt);
          /* reject other options */

          view1.setUint32(0, 0x0003e889);
          view1.setUint32(4, 0x045565a9);
          view1.setUint32(8, opt);
          view1.setUint32(12, NBD_REP_ERR_UNSUP);
          view1.setUint32(16, 0);
          this.ws.send(resp1);
      }
      return 16 + len;
    };
    this._create_cmd_response = function (req, rc, data: any = null) {
      let len = 16;
      if (data) len += data.byteLength;
      let resp = new ArrayBuffer(len);
      let view = new DataView(resp, 0, 16);
      view.setUint32(0, 0x67446698);
      view.setUint32(4, rc);
      view.setUint32(8, req.handle_msB);
      view.setUint32(12, req.handle_lsB);
      if (data) new Uint8Array(resp, 16).set(new Uint8Array(data));
      return resp;
    };
    this._handle_cmd = function (buf: ArrayBufferLike) {
      if (buf.byteLength < 28) {
        return 0;
      }
      let view = new DataView(buf, 0, 28);
      if (view.getUint32(0) != 0x25609513) {
        console.log('invalid request magic');
        return -1;
      }
      let req = {
        flags: view.getUint16(4),
        type: view.getUint16(6),
        handle_msB: view.getUint32(8),
        handle_lsB: view.getUint32(12),
        offset_msB: view.getUint32(16),
        offset_lsB: view.getUint32(20),
        length: view.getUint32(24),
      };
      /* we don't support writes, so nothing needs the data at present */
      /* req.data = buf.slice(28); */
      let err = 0;
      let consumed = 28;
      /* the command handlers return 0 on success, and send their
       * own response. Otherwise, a non-zero error code will be
       * used as a simple error response
       */
      switch (req.type) {
        case NBD_CMD_READ:
          err = this._handle_cmd_read(req);
          break;
        case NBD_CMD_DISC:
          err = this._handle_cmd_disconnect(req);
          break;
        case NBD_CMD_WRITE:
          /* we also need length bytes of data to consume a write
           * request */
          if (buf.byteLength < 28 + req.length) {
            return 0;
          }
          consumed += req.length;
          err = EPERM;
          break;
        case NBD_CMD_TRIM:
          err = EPERM;
          break;
        default:
          console.log('invalid command 0x' + req.type.toString(16));
          err = EINVAL;
      }
      if (err) {
        console.log('error handle_cmd: ' + err);
        let resp = this._create_cmd_response(req, err);
        this.ws.send(resp);
        if (err == ENOSPC) {
          this.errorReadingFile();
          this.stop();
        }
      }
      return consumed;
    };
    this._handle_cmd_read = function (req: {
      offset_msB: number;
      offset_lsB: number;
      length: any;
    }) {
      let offset;
      // eslint-disable-next-line prettier/prettier
      offset = (req.offset_msB * 2 ** 32) + req.offset_lsB;
      if (offset > Number.MAX_SAFE_INTEGER) return ENOSPC;
      if (offset + req.length > Number.MAX_SAFE_INTEGER) return ENOSPC;
      if (offset + req.length > file.size) return ENOSPC;
      let blob = this.file.slice(offset, offset + req.length);
      let reader = new FileReader();

      reader.onload = function (ev: { target: any }) {
        let reader = ev.target;
        if (reader.readyState != FileReader.DONE) return;
        let resp = this._create_cmd_response(req, 0, reader.result);
        this.ws.send(resp);
      }.bind(this);

      reader.onerror = function (ev: { target: any }) {
        let reader = ev.target;
        console.log('error reading file: ' + reader.error);
        let resp = this._create_cmd_response(req, EIO);
        this.ws.send(resp);
      }.bind(this);
      reader.readAsArrayBuffer(blob);
      return 0;
    };
    this._handle_cmd_disconnect = function () {
      this.stop();
      return 0;
    };
    this.recv_handlers = Object.freeze({
      [NBD_STATE_WAIT_CFLAGS]: this._handle_cflags.bind(this),
      [NBD_STATE_WAIT_OPTION]: this._handle_option.bind(this),
      [NBD_STATE_TRANSMISSION]: this._handle_cmd.bind(this),
    });
  }
}
