import React, { useState, useEffect } from "react";
import NewButton from "../../homePageComponents/Button";
import { useToast } from "../../../hooks/useToast";
import { VITE_API_URL } from "../../../../config"

// =================================================================
// VALIDACIÓN DE NOMBRE DE CANAL
// =================================================================
// Mínimo 5, máximo 20, solo letras (a-z, A-Z), números (0-9), guion bajo (_) y espacios SOLO en el medio (no al inicio ni al final).
const CHANNEL_NAME_REGEX = /^(?! )[a-zA-Z0-9_ ]{5,20}(?<! )$/;

async function apiFetch(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    const headers = { ...options.headers };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(`${VITE_API_URL}${url}`, { ...options, headers });

        if (response.status === 404) {
            return null;
        }

        const contentType = response.headers.get("content-type");
        let responseBody;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            responseBody = await response.json();
        } else {
            responseBody = { message: await response.text() };
        }

        if (!response.ok) {
            const errorMessage = Array.isArray(responseBody.message) ? responseBody.message.join(', ') : JSON.stringify(responseBody.message);
            alert(`Error ${response.status}: ${errorMessage}`);
            console.error('Server response:', response.status, responseBody);
            return null;
        }
        return responseBody;
    } catch (error) {
        console.error('Connection error:', error);
        alert('Could not connect to the server.');
        return null;
    }
}

function InfoContainer({ channelId }) {
    const { showSuccess, showError } = useToast();
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const [description, setDescription] = useState("");
    
    // Estados para validación
    const [nameValid, setNameValid] = useState(null);
    const [handleValid, setHandleValid] = useState(null); // NUEVO
    const [descriptionValid, setDescriptionValid] = useState(null); // NUEVO
    
    // Estados para rastrear si los campos han sido tocados
    const [touched, setTouched] = useState({
        name: false,
        handle: false,
        description: false,
    });

    useEffect(() => {
        async function loadChannelData() {
            try {
                if (!channelId) {
                    return;
                }
                const channelData = await apiFetch('/channels/' + channelId);
                if (channelData) {
                    const initialName = channelData.channel_name || "";
                    const initialHandle = channelData.url || "";
                    const initialDescription = channelData.description || "";

                    setName(initialName);
                    setHandle(initialHandle);
                    setDescription(initialDescription);
                    
                    // Validar los datos cargados
                    setNameValid(CHANNEL_NAME_REGEX.test(initialName));
                    setHandleValid(CHANNEL_NAME_REGEX.test(initialHandle));
                    setDescriptionValid(CHANNEL_NAME_REGEX.test(initialDescription));
                }
            } catch (error) {
                console.error('Error displaying channel data:', error);
            }
        }
        loadChannelData();
    }, [channelId]);

    // =================================================================
    // HANDLERS DE CAMBIO (ACTUALIZADOS)
    // =================================================================

    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        setNameValid(CHANNEL_NAME_REGEX.test(value));
        if (!touched.name) setTouched(prev => ({ ...prev, name: true }));
    };

    const handleHandleChange = (e) => {
        const value = e.target.value;
        setHandle(value);
        setHandleValid(CHANNEL_NAME_REGEX.test(value));
        if (!touched.handle) setTouched(prev => ({ ...prev, handle: true }));
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        setDescriptionValid(CHANNEL_NAME_REGEX.test(value));
        if (!touched.description) setTouched(prev => ({ ...prev, description: true }));
    };

    // =================================================================
    // HANDLER DE PUBLICACIÓN (ACTUALIZADO)
    // =================================================================

    const handlePublish = async () => {
        if (!channelId) {
            alert('Error: No se pudo identificar el canal. Por favor, inicia sesión de nuevo.');
            return;
        }

        // 1. Validar todos los campos antes de enviar
        setTouched({ name: true, handle: true, description: true });

        const isNameValid = name.length > 0 ? CHANNEL_NAME_REGEX.test(name) : true; // Permitir que esté vacío si no se va a actualizar
        const isHandleValid = handle.length > 0 ? CHANNEL_NAME_REGEX.test(handle) : true;
        const isDescriptionValid = description.length > 0 ? CHANNEL_NAME_REGEX.test(description) : true;
        
        // Forzar la actualización de los estados de validación para el feedback visual
        setNameValid(isNameValid);
        setHandleValid(isHandleValid);
        setDescriptionValid(isDescriptionValid);

        if (!isNameValid || !isHandleValid || !isDescriptionValid) {
            showError('Please correct the highlighted fields before publishing.');
            return;
        }

        const updateData = {};

        if (name) {
            updateData.channel_name = name;
        }
        if (handle) {
            updateData.url = handle.replace('@', '');
        }
        if (description) {
            updateData.description = description;
        }

        if (Object.keys(updateData).length === 0) {
            alert('No hay cambios para publicar.');
            return;
        }

        try {
            const result = await apiFetch(`/channels/${channelId}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData),
            });

            if (result) {
                showSuccess('¡Channel successfully updated!');
                if (result.channel_name) setName(result.channel_name);
                if (result.url) setHandle(result.url);
                if (result.description) setDescription(result.description);
            } else {
                const errorMessage = (result && result.message) || 'Ocurrió un error desconocido.';
                showError('Error al actualizar: ' + JSON.stringify(errorMessage));
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor.');
        }
    };

    // =================================================================
    // LÓGICA DE CLASES Y TEXTO DE AYUDA (ACTUALIZADA)
    // =================================================================

    // Determinar la clase CSS del input según validación
    const getInputClass = (fieldName) => {
        let isValid, isTouched, value;

        if (fieldName === 'name') {
            isValid = nameValid;
            isTouched = touched.name;
            value = name;
        } else if (fieldName === 'handle') {
            isValid = handleValid;
            isTouched = touched.handle;
            value = handle;
        } else if (fieldName === 'description') {
            isValid = descriptionValid;
            isTouched = touched.description;
            value = description;
        } else {
            return 'rectangle-customization';
        }

        if (!isTouched || value === '') return fieldName === 'description' ? 'rectangle-customization-description' : 'rectangle-customization';
        
        const baseClass = fieldName === 'description' ? 'rectangle-customization-description' : 'rectangle-customization';

        if (isValid === true) return `${baseClass} correct-input`;
        if (isValid === false) return `${baseClass} incorrect-input`;
        
        return baseClass;
    };

    // Mensaje de ayuda
    const getHelperText = (fieldName) => {
        let isValid, isTouched, value;

        if (fieldName === 'name') {
            isValid = nameValid;
            isTouched = touched.name;
            value = name;
        } else if (fieldName === 'handle') {
            isValid = handleValid;
            isTouched = touched.handle;
            value = handle;
        } else if (fieldName === 'description') {
            isValid = descriptionValid;
            isTouched = touched.description;
            value = description;
        } else {
            return '';
        }

        if (isValid === false && value !== '' && isTouched) {
            return 'Min 5, max 20 chars (letters, numbers, _). No spaces at start/end.';
        }
        return '';
    };

    const helperTextStyle = (fieldName) => ({
        color: '#fcc4c4',
        fontSize: '12px',
        marginTop: '4px',
        marginBottom: '8px',
        display: getHelperText(fieldName) ? 'block' : 'none'
    });

    // =================================================================
    // RENDERIZADO (ACTUALIZADO)
    // =================================================================

    return (
        <div className="info-customization-container">
            <span>Name</span>
            <input 
                type="text" 
                id="channel-name-input" 
                className={getInputClass('name')} 
                placeholder="name" 
                value={name} 
                onChange={handleNameChange}
                onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            />
            <div style={helperTextStyle('name')}>{getHelperText('name')}</div>

            <span>Handle</span>
            <input 
                type="text" 
                id="channel-handle-input" 
                className={getInputClass('handle')} 
                placeholder="@name" 
                value={handle} 
                onChange={handleHandleChange}
                onBlur={() => setTouched(prev => ({ ...prev, handle: true }))}
            />
            <div style={helperTextStyle('handle')}>{getHelperText('handle')}</div>

            <span>Description</span>
            <input 
                type="text" 
                id="channel-description-input" 
                className={getInputClass('description')} 
                placeholder="Description" 
                value={description} 
                onChange={handleDescriptionChange}
                onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
            />
            <div style={helperTextStyle('description')}>{getHelperText('description')}</div>

            <NewButton id="publish-changes-btn" btnclass="custom-file-label" btntitle="Publish" onClick={handlePublish}></NewButton>
        </div>
    );
}

export default InfoContainer;