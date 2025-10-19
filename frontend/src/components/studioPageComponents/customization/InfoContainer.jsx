import React, { useState, useEffect } from "react";
import NewButton from "../../homePageComponents/Button";

const BASE_URL = 'http://localhost:3000';

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
        const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

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

function InfoContainer() {
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        async function loadChannelData() {
            try {
                const channelData = await apiFetch('/channels/' + localStorage.getItem('channelId'));
                if (channelData) {
                    setName(channelData.channel_name || "");
                    setHandle(channelData.url || "");
                    setDescription(channelData.description || "");
                }
            } catch (error) {
                console.error('Error displaying channel data:', error);
            }
        }
        loadChannelData();
    }, []);

    const handlePublish = async () => {
        const channelId = localStorage.getItem('channelId');

        if (!channelId) {
            alert('Error: No se pudo identificar el canal. Por favor, inicia sesión de nuevo.');
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
                alert('¡Canal actualizado con éxito!');
                if (result.channel_name) setName(result.channel_name);
                if (result.url) setHandle(result.url);
                if (result.description) setDescription(result.description);
            } else {
                const errorMessage = (result && result.message) || 'Ocurrió un error desconocido.';
                alert('Error al actualizar: ' + JSON.stringify(errorMessage));
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor.');
        }
    };

    return (
        <div className="info-customization-container">
            <span>Name</span>
            <input type="text" id="channel-name-input" className="rectangle-customization" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />

            <span>Handle</span>
            <input type="text" id="channel-handle-input" className="rectangle-customization" placeholder="@name" value={handle} onChange={(e) => setHandle(e.target.value)} />

            <span>Description</span>
            <input type="text" id="channel-description-input" className="rectangle-customization-description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <NewButton id="publish-changes-btn" btnclass="custom-file-label" btntitle="Publish" onClick={handlePublish}></NewButton>
        </div>
    );
}

export default InfoContainer;
