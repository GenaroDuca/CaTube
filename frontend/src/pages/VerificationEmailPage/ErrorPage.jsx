import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ErrorPage = () => {
    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason'); // Lee el motivo enviado por el servidor

    const message = reason === 'expired'
        ? 'El enlace de verificación ha caducado. Por favor, solicita un nuevo correo.'
        : 'El token de verificación es inválido. Verifica si copiaste el enlace completo.';

    return (
        <div style={{ textAlign: 'center' }}>
            <img style={{ width: "100px", marginTop: "-10px" }} src="catube_white.png" alt="CaTube Logo" />
            <h1>Email Verification Error!</h1>
            <h2 style={{ color: '#90b484' }}>Please contact CaTube Support</h2>
            <a href="mailto:catubeapp@gmail.com">catubeapp@gmail.com</a>
        </div >
    );
};

export default ErrorPage;