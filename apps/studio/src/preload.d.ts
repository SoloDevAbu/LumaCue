// export {};

// declare global {
//   interface Window {
//     lumacue?: {
//       enterOverlay: () => Promise<boolean>;
//       minimize: () => void;
//       restore: () => void;
//       getPosition: () => Promise<{ sw: number; sh: number }>;
//       onModeChange: (cb: (mode: string) => void) => void;
//       removeAllListeners: (channel: string) => void;
//     };
//     ai?: {
//       initialize: (config: { apiKey: string }) => Promise<unknown>;
//       isInitialized: () => Promise<boolean>;
//       chat: (messages: any[], options?: any) => Promise<unknown>;
//       startStreamChat: (messages: any[], options?: any) => Promise<unknown>;
//       onStreamChunk: (cb: (d: { streamId: string; chunk: any }) => void) => void;
//       onStreamEnd: (cb: (d: { streamId: string }) => void) => void;
//       onStreamError: (cb: (d: { streamId: string; error: string }) => void) => void;
//       getTools: () => Promise<unknown>;
//       getToolCategories: () => Promise<unknown>;
//       getConfig: () => Promise<unknown>;
//       removeAllListeners: (channel: string) => void;
//     };
//   }
// }
