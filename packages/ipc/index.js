const IPC_CHANNELS = {
  INVOKE: {
    FIRST_LAUNCH: "lumacue:first-launch",
  },
  SEND: {
    ENTER_COMPACT: "lumacue:enter-compact",
    OPEN_CHAT: "lumacue:open-chat",
    CLOSE_CHAT: "lumacue:close-chat",
    CHAT_SET_HEIGHT: "lumacue:chat:set-height",
    REPOSITION_CHAT_BELOW_HEADER: "lumacue:reposition-chat-below-header",
  },
  CHAT: {
    STREAM_REQUEST: "lumacue:llm:chat-stream",
    STREAM_ABORT: "lumacue:llm:abort",
    streamData(channel) {
      return `${channel}:data`;
    },
    streamEnd(channel) {
      return `${channel}:end`;
    },
    streamError(channel) {
      return `${channel}:error`;
    },
  },
  PUSH: {
    MODE_CHANGED: "lumacue:mode",
  },
};

const WINDOW_MODES = {
  DEFAULT: "default",
  COMPACT: "compact",
};

const GLOBAL_SHORTCUTS = {
  TOGGLE_MAIN_VISIBILITY: "CommandOrControl+T",
};

const CHAT_WINDOW_DEFAULTS = {
  WIDTH: 600,
  HEIGHT: 300,
  GAP_FROM_HEADER: 8,
  MIN_HEIGHT: 120,
  MAX_HEIGHT_RATIO: 0.8,
};

export { IPC_CHANNELS, WINDOW_MODES, GLOBAL_SHORTCUTS, CHAT_WINDOW_DEFAULTS };
