import { IoIosCloseCircle } from "react-icons/io";

/**
 * Modal universal de confirmación para cualquier acción de eliminación o irreversible.
 *
 * @param {object} props
 * @param {string} props.title - Título del modal (ej: "Eliminar Amigo")
 * @param {string} props.message - Pregunta principal (ej: "¿Estás seguro de que quieres eliminar a Juan?")
 * @param {string} props.confirmText - Texto del botón de acción (ej: "Eliminar Permanentemente")
 * @param {function} props.onConfirm - La función que se ejecuta al presionar el botón de confirmación (el fetch)
 * @param {function} props.onClose - La función para cerrar el modal
 * @param {boolean} [props.isProcessing=false] - Para deshabilitar el botón durante la solicitud
 * @param {string} [props.buttonClass="delete-account-btn"] - Clase CSS específica para el botón de acción
 */
const ConfirmModal = ({
    title,
    message,
    confirmText,
    onConfirm,
    onClose,
    isProcessing = false,
    buttonClass = "delete-account-btn" // Clase por defecto o la que definas
}) => {

    // El handler llama a la función onConfirm que viene de la prop
    const handleConfirm = async () => {
        if (!isProcessing) {
            await onConfirm();
        }
    };

    return (
        // Usar un className genérico para el contenedor
        <div className="universal-modal-overlay">
            <div className="universal-modal-content">
                <header>
                    <h1>{title}</h1>
                    <button type="button" onClick={onClose} className="close-modal-btn">
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>
                <main>
                    <h3>{message}</h3>
                    <div>

                        <button
                            className={buttonClass}
                            onClick={handleConfirm}
                            disabled={isProcessing} // Deshabilita mientras se envía la petición
                        >
                            {isProcessing ? 'Procesando...' : confirmText}
                        </button>

                        <h4>This action is irreversible.</h4>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default ConfirmModal;