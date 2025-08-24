// import { useState } from "react";

// export default function Overlay() {
//   const [text, setText] = useState("");

//   return (
//     <div className="app-wrapper">
//       <div className=" w-full drag-area fixed top-0 left-0 right-0 flex justify-end">
//         <div style={{ display: "flex", gap: 8 }}>
//           <button 
//           className="no-drag"
//           onClick={() => window.lumacue?.minimize()}>—</button>
//           <button 
//           className="no-drag"
//           onClick={() => alert("Settings clicked (not wired)")}>
//             ⚙
//           </button>
//           <button 
//           className="no-drag"
//           onClick={() => window.close()}>✕</button>
//         </div>
//       </div>

//       <div className="fixed bottom-2 m-2 left-0 right-0 flex flex-col justify-center items-center rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ">
//         <textarea
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Ask LumaCue: open the latest image..."
//           className="w-full max-w-md p-1 resize-none border-none focus:outline-none"

//         />
//         <div className="flex justify-end w-full max-w-md p-0.5">
//           <button
//             onClick={() => {
//               console.log("send", text);
//               setText("");
//             }}
//           >
//             ➤
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }