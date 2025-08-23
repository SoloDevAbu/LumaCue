import { useState } from "react";

export default function SettingsScreen({ onDone }: { onDone: () => void }) {
  const [hotkeyEnabled, setHotkeyEnabled] = useState(true);
  const [other, setOther] = useState(false);

  return (
    <div className="card">
      <h3>Settings</h3>
      <div className="settingRow">
        <label>Enable hotkey (Cmd/Ctrl + Space)</label>
        <input
          type="checkbox"
          checked={hotkeyEnabled}
          onChange={() => setHotkeyEnabled((s) => !s)}
        />
      </div>
      <div className="settingRow">
        <label>Some other toggle</label>
        <input
          type="checkbox"
          checked={other}
          onChange={() => setOther((s) => !s)}
        />
      </div>
      <p>
        From next time you will only see the transparent dialog and from the
        settings icon you can change settings later.
      </p>
      <div style={{ marginTop: 12 }}>
        <button onClick={onDone}>Continue</button>
      </div>
    </div>
  );
}