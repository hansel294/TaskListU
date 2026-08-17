export default function Modal({ titulo, mensaje, textoBoton, onCerrar }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-box">
        <div className="modal-icon">✓</div>
        <h3>{titulo}</h3>
        <p>{mensaje}</p>
        <button className="btn-primary" onClick={onCerrar}>
          {textoBoton}
        </button>
      </div>
    </div>
  );
}
