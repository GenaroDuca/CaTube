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
            <img style={{ width: "100px", marginTop: "-10px" }} src="../../../public/catube_white.png" alt="CaTube Logo" />
            <h1>Email Verification Error!</h1>
            <h2 style={{ color: '#90b484' }}>Please contact CaTube Support</h2>
            <a href="mailto:catubeapp@gmail.com">catubeapp@gmail.com</a>
            {/* Si el error fue por caducidad, ofrece reenviar */}
            {
                reason === 'expired' && (
                    <Link to="/resend-verification">
                        <button style={{
                            padding: '20px 40px',
                            backgroundColor: '#90b484',
                            border: 'none',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            marginTop: "30px"
                        }}>
                            Reesend verification email
                        </button>
                    </Link>
                )
            }
        </div >
    );
};

export default ErrorPage;