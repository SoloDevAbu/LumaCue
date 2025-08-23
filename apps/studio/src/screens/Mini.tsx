export default function MiniCircle() {
  return (
    <div
      className="mini"
      onClick={() => window.lumacue.restore()}
      title="Restore LumaCue"
    >
      <div className="miniInner">LC</div>
    </div>
  );
}