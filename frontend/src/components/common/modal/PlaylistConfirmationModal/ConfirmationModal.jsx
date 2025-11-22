import "./ConfirmationModal.css";

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    messsage,
    confirmText = "Eliminar",
    cancelText = "Cancelar"
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-header">
                <h3>{title}</h3>

            <div className="modal-body">
                <p>{messsage}</p>
            </div>
            <div className="modal-action">
                <button className="btn-cancel" onClick={onClose}>
                    {cancelText}
                </button>
                <button className="btn-confirm" onClick={onConfirm}>
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);
};

export default ConfirmationModal;