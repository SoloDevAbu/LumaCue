declare module "@lumacue/ipc" {
  import type {
    IPC_CHANNELS as BaseIpcChannels,
    WINDOW_MODES as BaseWindowModes,
    GLOBAL_SHORTCUTS as BaseGlobalShortcuts,
    CHAT_WINDOW_DEFAULTS as BaseChatWindowDefaults,
  } from "../../../packages/ipc/index.d.ts";

  export const IPC_CHANNELS: BaseIpcChannels;
  export const WINDOW_MODES: BaseWindowModes;
  export const GLOBAL_SHORTCUTS: BaseGlobalShortcuts;
  export const CHAT_WINDOW_DEFAULTS: BaseChatWindowDefaults;
}
