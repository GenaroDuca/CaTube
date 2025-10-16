import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { BsPersonFill } from "react-icons/bs";
import { FaKey } from "react-icons/fa";
import { HiMail } from "react-icons/hi";

// =================================================================
// 0. HOOK PERSONALIZADO PARA DEBOUNCING
// =================================================================
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// =================================================================
// 1. CONSTANTES PARA VALIDACIÓN
// =================================================================

// Mínimo 5, máximo 20, solo letras (a-z, A-Z), números (0-9) y guion bajo (_).
const USERNAME_REGEX = /^[a-zA-Z0-9_]{5,20}$/;

// Estándar de email más robusto.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const SignupForm = ({ togglePanel }) => {
    // Estados de entrada de formulario
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    // Estados para validación de formato
    const [usernameValid, setUsernameValid] = useState(null);
    const [emailValid, setEmailValid] = useState(null);
    const [passwordValid, setPasswordValid] = useState(null);
    const [repeatPasswordValid, setRepeatPasswordValid] = useState(null);

    // Estados para manejar errores de UNICIDAD del backend
    const [usernameExistsError, setUsernameExistsError] = useState(false);
    const [emailExistsError, setEmailExistsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Estado para rastrear si el usuario ha interactuado con los campos
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        repeatPassword: false,
    });

    // Debounce: Usamos los valores debounced para enviar al servidor
    const debouncedUsername = useDebounce(username, 500);
    const debouncedEmail = useDebounce(email, 500);

    // =================================================================
    // 2. FUNCIONES DE VALIDACIÓN
    // =================================================================

    const validateUsername = (value) => USERNAME_REGEX.test(value);
    const validateEmail = (value) => EMAIL_REGEX.test(value);
    const validatePassword = (value) => PASSWORD_REGEX.test(value);
    const validateRepeatPassword = (value) => value === password && passwordValid;

    // =================================================================
    // 3. HANDLERS DE CAMBIO
    // =================================================================

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        setUsernameValid(validateUsername(value));
        setUsernameExistsError(false);
        if (!touched.username) setTouched(prev => ({ ...prev, username: true }));
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setEmailValid(validateEmail(value));
        setEmailExistsError(false);
        if (!touched.email) setTouched(prev => ({ ...prev, email: true }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        
        const validFormat = validatePassword(value);
        setPasswordValid(validFormat);

        // Revalidar la contraseña repetida usando el NUEVO 'value'
        const isRepeatValidNow = repeatPassword === value && validFormat;
        setRepeatPasswordValid(isRepeatValidNow); 

        if (!touched.password) setTouched(prev => ({ ...prev, password: true }));
    };

    const handleRepeatPasswordChange = (e) => {
        const value = e.target.value;
        setRepeatPassword(value);
        setRepeatPasswordValid(validateRepeatPassword(value));
        if (!touched.repeatPassword) setTouched(prev => ({ ...prev, repeatPassword: true }));
    };

    // =================================================================
    // 4. LÓGICA DE UNICIDAD (usando useEffect y debouncing)
    // =================================================================
    
    // 4.1. Chequeo de Unicidad de Username
    useEffect(() => {
        if (usernameValid === true && touched.username) {
            checkUniqueness('username', debouncedUsername);
        } else if (username === '' || usernameValid === false) {
             setUsernameExistsError(false);
        }
    }, [debouncedUsername, usernameValid, touched.username]);

    // 4.2. Chequeo de Unicidad de Email
    useEffect(() => {
        if (emailValid === true && touched.email) {
            checkUniqueness('email', debouncedEmail);
        } else if (email === '' || emailValid === false) {
             setEmailExistsError(false);
        }
    }, [debouncedEmail, emailValid, touched.email]);

    // Función genérica para chequear unicidad
    const checkUniqueness = async (field, value) => {
        if (!value) return; 

        try {
            const response = await fetch(`http://localhost:3000/users/check/${field}?value=${value}`);

            if (response.status === 409) {
                if (field === 'username') {
                    setUsernameExistsError(true);
                } else {
                    setEmailExistsError(true);
                }
            } else if (response.ok) {
                if (field === 'username') {
                    setUsernameExistsError(false);
                } else {
                    setEmailExistsError(false);
                }
            }
        } catch (error) {
            console.error(`Error al chequear ${field}:`, error);
        }
    };


    // =================================================================
    // 5. LÓGICA DE SUBMISIÓN
    // =================================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isUsernameValid = validateUsername(username);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isRepeatPasswordValid = validateRepeatPassword(repeatPassword);

        setUsernameValid(isUsernameValid);
        setEmailValid(isEmailValid);
        setPasswordValid(isPasswordValid);
        setRepeatPasswordValid(isRepeatPasswordValid);
        setTouched({ username: true, email: true, password: true, repeatPassword: true });

        const formFormatValid = isUsernameValid && isEmailValid && isPasswordValid && isRepeatPasswordValid;
        
        if (!formFormatValid || usernameExistsError || emailExistsError) {
            console.log('Error: Formato o unicidad fallida. No se envía al servidor.');
            return;
        }

        setIsSubmitting(true);

        const userData = { username, email, password };
        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('¡Registro exitoso! Redirigiendo...');
                togglePanel(); 
            } else {
                const errorMessage = result.message || 'Error desconocido';
                console.error('Error al registrar (Servidor):', errorMessage);
                if (errorMessage.includes('Username already exists')) setUsernameExistsError(true);
                if (errorMessage.includes('Email already exists')) setEmailExistsError(true);
            }
        } catch (error) {
            console.error('Error de conexión/red:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // =================================================================
    // 6. LÓGICA DE CLASES Y COLORES
    // =================================================================

    const getInputClass = (inputName) => {
        const isValid = inputName === 'username' ? usernameValid
            : inputName === 'email' ? emailValid
                : inputName === 'password' ? passwordValid
                    : inputName === 'repeatPassword' ? repeatPasswordValid
                        : null;

        const isUniquenessError = (inputName === 'username' && usernameExistsError) || (inputName === 'email' && emailExistsError);
        
        const inputValue = inputName === 'username' ? username : inputName === 'email' ? email : inputName === 'password' ? password : repeatPassword;
        
        // El input está vacío
        const isEmpty = inputValue === '';
        
        // Muestra feedback si ha sido tocado Y no está vacío, O si hay un error de unicidad.
        const shouldShowFeedback = (touched[inputName] && !isEmpty) || isUniquenessError;

        if (shouldShowFeedback) {
            // Muestra verde si el formato es válido Y NO hay error de unicidad
            if (isValid === true && !isUniquenessError) return 'input correct-input';
            
            // Muestra rojo si es inválido O si hay error de unicidad
            if (isValid === false || isUniquenessError) return 'input incorrect-input';
        }

        return 'input';
    };

    // Lógica para el color de las etiquetas de ayuda: rojo si hay error, sino por defecto.
    const getLabelColor = (inputName) => {
        let hasError = false;
        let inputValue = '';
        
        if (inputName === 'username') {
            hasError = usernameExistsError || (usernameValid === false && touched.username);
            inputValue = username;
        } else if (inputName === 'email') {
            hasError = emailExistsError || (emailValid === false && touched.email);
            inputValue = email;
        } else if (inputName === 'password') {
            hasError = passwordValid === false && touched.password;
            inputValue = password;
        } else if (inputName === 'repeatPassword') {
            hasError = repeatPasswordValid === false && touched.repeatPassword;
            inputValue = repeatPassword;
        }

        // Determina si debe mostrarse el color de error.
        // Incluye los errores de unicidad (que persisten) incluso si el campo está vacío.
        const showError = hasError && (inputValue !== '' || usernameExistsError || emailExistsError);

        return showError ? '#fcc4c4' : 'inherit';
    };

    // 🎯 Lógica para el texto de las etiquetas de ayuda: Cambia solo por Unicidad.
    const getLabelText = (inputName) => {
        if (inputName === 'username') {
            return usernameExistsError ? 
                '¡Este usuario ya existe! Elige otro.' : // Texto de error de unicidad
                'Mín 5, máx 20 caracteres (letras, números, _)'; // Texto por defecto
        }
        if (inputName === 'email') {
            return emailExistsError ?
                '¡Este email ya está registrado!' : // Texto de error de unicidad
                'Formato: example@domain.com'; // Texto por defecto
        }
        if (inputName === 'password') {
             // Texto fijo para password
             return 'Min 8 characters (at least 1 uppercase, 1 lowercase, 1 number)';
        }
        if (inputName === 'repeatPassword') {
            // Texto fijo para repeat password
            return 'Confirma tu contraseña';
        }
        return '';
    }

    const isFormValid = useMemo(() => {
        const allFieldsFilled = username.length > 0 && email.length > 0 && password.length > 0 && repeatPassword.length > 0;

        return allFieldsFilled &&
            validateUsername(username) &&
            validateEmail(email) &&
            validatePassword(password) &&
            validateRepeatPassword(repeatPassword) &&
            !usernameExistsError && 
            !emailExistsError &&
            !isSubmitting;
    }, [username, email, password, repeatPassword, isSubmitting, usernameExistsError, emailExistsError]);

    // =================================================================
    // 7. RENDERIZADO
    // =================================================================
    
    return (
        <form className="form-section" autoComplete="off" onSubmit={handleSubmit}>
            <h1>Sign Up</h1>

            {/* CAMPO USERNAME */}
            <div className="input-group">
                <div className="input-row">
                    <div className="icon-circle"><BsPersonFill size={25} color="#1a1a1b" /></div>
                    <input
                        type="text"
                        placeholder="Username"
                        className={getInputClass('username')}
                        value={username}
                        onChange={handleUsernameChange}
                        required
                        autoComplete="nope"
                        disabled={isSubmitting}
                    />
                </div>
            </div>
            
            {/* FEEDBACK USERNAME (Texto cambia SOLO por unicidad, Color cambia por cualquier error) */}
            <label 
                htmlFor="text" 
                style={{ 
                    color: getLabelColor('username'), // Color dinámico
                    fontSize: '12px', 
                    textAlign: 'center' 
                }}
            >
                {getLabelText('username')} 
            </label>

            {/* CAMPO EMAIL */}
            <div className="input-group">
                <div className="input-row">
                    <div className="icon-circle"><HiMail size={25} color="#1a1a1b" /></div>
                    <input
                        type="email"
                        placeholder="Mail"
                        className={getInputClass('email')}
                        value={email}
                        onChange={handleEmailChange}
                        required
                        autoComplete="off"
                        disabled={isSubmitting}
                    />
                </div>
            </div>
            
            {/* FEEDBACK EMAIL (Texto cambia SOLO por unicidad, Color cambia por cualquier error) */}
            <label 
                htmlFor="email" 
                style={{ 
                    color: getLabelColor('email'), // Color dinámico
                    fontSize: '12px', 
                    textAlign: 'center' 
                }}
            >
                {getLabelText('email')} 
            </label>

            {/* CAMPO PASSWORD */}
            <div className="input-group">
                <div className="input-row">
                    <div className="icon-circle"><FaKey size={20} color="#1a1a1b" /></div>
                    <input
                        type="password"
                        placeholder="Password"
                        className={getInputClass('password')}
                        value={password}
                        onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                        onChange={handlePasswordChange}
                        required
                        autoComplete="new-password"
                        disabled={isSubmitting}
                    />
                </div>
            </div>
            
            {/* FEEDBACK PASSWORD (Texto fijo, Color cambia por cualquier error) */}
            <label
                htmlFor="password"
                style={{
                    color: getLabelColor('password'), // Color dinámico
                    fontSize: '12px',
                    textAlign: 'center'
                }}
            >
                {getLabelText('password')} 
            </label>

            {/* CAMPO REPEAT PASSWORD */}
            <div className="input-group">
                <div className="input-row">
                    <div className="icon-circle"><FaKey size={20} color="#1a1a1b" /></div>
                    <input
                        type="password"
                        placeholder="Repeat Password"
                        className={getInputClass('repeatPassword')}
                        value={repeatPassword}
                        onBlur={() => setTouched(prev => ({ ...prev, repeatPassword: true }))}
                        onChange={handleRepeatPasswordChange}
                        required
                        autoComplete="new-password"
                        disabled={isSubmitting}
                    />
                </div>
            </div>
            
            {/* FEEDBACK REPEAT PASSWORD (Texto fijo, Color cambia por cualquier error) */}
            <label
                htmlFor="repeat-password"
                style={{
                    color: getLabelColor('repeatPassword'), // Color dinámico
                    fontSize: '12px',
                    textAlign: 'center'
                }}
            >
                {getLabelText('repeatPassword')} 
            </label>

            <button type="submit" className="register-btn" disabled={!isFormValid}>
                {isSubmitting ? 'Registrando...' : 'Sign Up'}
            </button>
        </form>
    );
};

export default SignupForm;