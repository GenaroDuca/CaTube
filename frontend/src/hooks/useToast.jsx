import { toast, Bounce } from "react-toastify";
import { NOTIFICATION_TYPES, NOTIFICATION_CONFIG } from "../components/common/toast/ToastConfig";

export const useToast = () => {
    
    const showToast = (type, message) => {
        const config = NOTIFICATION_CONFIG[type];
        if (!config || !message) return;

        toast[config.type](message, {
            position: "top-right",
            autoClose: config.autoClose,
            hideProgressBar: false,
            newestOnTop: false,
            closeOnClick: true,
            rtl: false,
            pauseOnFocusLoss: true,
            draggable: true, 
            pauseOnHover: true,
            theme: config.theme,
            transition: Bounce,
            style: config.style,
            closeButton: false, 
        });
    }

    /** Muestra un toast de éxito. */
    const showSuccess = (message) => {
        showToast(NOTIFICATION_TYPES.SUCCESS, message);
    }

    /** Muestra un toast de error. */
    const showError = (message) => {
        showToast(NOTIFICATION_TYPES.ERROR, message);
    }

    // Devolvemos solo las funciones sencillas para usar en los componentes
    return { showSuccess, showError };
}