export default function ConfirmModal({ titulo, mensaje, textoConfirmar, onConfirmar, onCancelar }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-box">
        <div className="modal-icon modal-icon-warning">!</div>
        <h3>{titulo}</h3>
        <p>{mensaje}</p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancelar}>Cancelar</button>
          <button className="btn-danger" onClick={onConfirmar}>{textoConfirmar}</button>
        </div>
      </div>
    </div>
  );
}
