export declare const IPC_CHANNELS: {
  readonly INVOKE: {
    readonly FIRST_LAUNCH: "lumacue:first-launch";
  };
  readonly SEND: {
    readonly ENTER_COMPACT: "lumacue:enter-compact";
    readonly OPEN_CHAT: "lumacue:open-chat";
    readonly CLOSE_CHAT: "lumacue:close-chat";
    readonly CHAT_SET_HEIGHT: "lumacue:chat:set-height";
    readonly REPOSITION_CHAT_BELOW_HEADER: "lumacue:reposition-chat-below-header";
  };
  readonly CHAT: {
    readonly STREAM_REQUEST: "lumacue:llm:chat-stream";
    readonly STREAM_ABORT: "lumacue:llm:abort";
    readonly streamData: (channel: string) => string;
    readonly streamEnd: (channel: string) => string;
    readonly streamError: (channel: string) => string;
  };
  readonly PUSH: {
    readonly MODE_CHANGED: "lumacue:mode";
  };
};

export declare const WINDOW_MODES: {
  readonly DEFAULT: "default";
  readonly COMPACT: "compact";
};

export declare const GLOBAL_SHORTCUTS: {
  readonly TOGGLE_MAIN_VISIBILITY: "CommandOrControl+T";
};

export declare const CHAT_WINDOW_DEFAULTS: {
  readonly WIDTH: 600;
  readonly HEIGHT: 300;
  readonly GAP_FROM_HEADER: 8;
  readonly MIN_HEIGHT: 120;
  readonly MAX_HEIGHT_RATIO: 0.8;
};
