import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../hooks/useToast.jsx';

import { BsPersonFill } from "react-icons/bs";
import { FaKey } from "react-icons/fa";
import { HiMail } from "react-icons/hi";

// =================================================================
// 0. HOOK PERSONALIZADO PARA DEBOUNCING (ELIMINADO para verificación instantánea)
// =================================================================
// La función useDebounce se elimina para que la verificación sea en tiempo real.

// =================================================================
// 1. CONSTANTES PARA VALIDACIÓN
// =================================================================

// Mínimo 5, máximo 20, solo letras (a-z, A-Z), números (0-9) y guion bajo (_).
const USERNAME_REGEX = /^[a-zA-Z0-9_ ]{5,20}$/;

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

    // Las variables debouncedUsername y debouncedEmail se han eliminado.

    // Feedback Toast
    const { showSuccess, showError } = useToast();

    // =================================================================
    // 2. FUNCIONES DE VALIDACIÓN
    // =================================================================

    const validateUsername = (value) => USERNAME_REGEX.test(value);
    const validateEmail = (value) => EMAIL_REGEX.test(value);
    const validatePassword = (value) => PASSWORD_REGEX.test(value);
    // Valida que sean iguales y que la original sea válida en formato
    const validateRepeatPassword = (value) => value === password && passwordValid;

    // =================================================================
    // 3. HANDLERS DE CAMBIO
    // =================================================================

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        setUsernameValid(validateUsername(value));
        setUsernameExistsError(false); // Borra el error de unicidad al empezar a escribir
        if (!touched.username) setTouched(prev => ({ ...prev, username: true })); // Marca como tocado al primer cambio
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setEmailValid(validateEmail(value));
        setEmailExistsError(false); // Borra el error de unicidad al empezar a escribir
        if (!touched.email) setTouched(prev => ({ ...prev, email: true })); // Marca como tocado al primer cambio
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        const validFormat = validatePassword(value);
        setPasswordValid(validFormat);
        // Revalida la repetición de contraseña inmediatamente
        const isRepeatValidNow = repeatPassword === value && validFormat;
        setRepeatPasswordValid(isRepeatValidNow);
        if (!touched.password) setTouched(prev => ({ ...prev, password: true }));
    };

    const handleRepeatPasswordChange = (e) => {
        const value = e.target.value;
        setRepeatPassword(value);
        // La validación depende del nuevo valor y del password original (passwordValid)
        setRepeatPasswordValid(validateRepeatPassword(value));
        if (!touched.repeatPassword) setTouched(prev => ({ ...prev, repeatPassword: true }));
    };

    // =================================================================
    // 4. LÓGICA DE UNICIDAD (INSTANTÁNEA)
    // =================================================================

    // Función para chequear unicidad
    const checkUniqueness = async (field, value) => {
        if (!value) return;

        try {
            // Llama al servidor de forma instantánea
            const response = await fetch(`http://localhost:3000/users/check/${field}?value=${value}`);

            if (response.status === 409) { // Conflicto: Ya existe
                if (field === 'username') {
                    setUsernameExistsError(true); // ¡Actualización de estado que dispara el cambio de label!
                } else {
                    setEmailExistsError(true); // ¡Actualización de estado que dispara el cambio de label!
                }
            } else if (response.ok) { // Disponible
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

    // 4.1. Chequeo de Unicidad de Username (SE DISPARA CON CADA CAMBIO)
    useEffect(() => {
        // Ejecuta la verificación instantánea si el formato es válido, ha sido tocado y tiene valor.
        if (usernameValid === true && touched.username && username.length > 0) {
            checkUniqueness('username', username);
        } else if (username === '' || usernameValid === false) {
            // Limpia el error si el campo está vacío o el formato es incorrecto
            setUsernameExistsError(false);
        }
    }, [username, usernameValid, touched.username]); // Dependencia clave: 'username' (instantáneo)

    // 4.2. Chequeo de Unicidad de Email (SE DISPARA CON CADA CAMBIO)
    useEffect(() => {
        if (emailValid === true && touched.email && email.length > 0) {
            checkUniqueness('email', email);
        } else if (email === '' || emailValid === false) {
            setEmailExistsError(false);
        }
    }, [email, emailValid, touched.email]); // Dependencia clave: 'email' (instantáneo)

    // =================================================================
    // 5. LÓGICA DE SUBMISIÓN
    // =================================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validar el formato de todos los campos
        const isUsernameValid = validateUsername(username);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isRepeatPasswordValid = validateRepeatPassword(repeatPassword);

        // 2. Forzar la actualización visual del feedback
        setUsernameValid(isUsernameValid);
        setEmailValid(isEmailValid);
        setPasswordValid(isPasswordValid);
        setRepeatPasswordValid(isRepeatPasswordValid);
        setTouched({ username: true, email: true, password: true, repeatPassword: true });

        // Verificar errores en el cliente antes de enviar
        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isRepeatPasswordValid || usernameExistsError || emailExistsError) {
             showError('Please correct the highlighted fields before submitting.');
             return;
        }

        // Si es válido, proceder con el envío
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
                showSuccess(`Successfully registered, now verify your mail!`);
                togglePanel();
            } else {
                // Error del servidor (ej. un error de unicidad final)
                const errorMessage = result.message || 'Unknown Server Error';

                if (errorMessage.includes('Username already exists')) {
                    setUsernameExistsError(true);
                    showError('Username already exists, try another!');
                } else if (errorMessage.includes('Email already exists')) {
                    setEmailExistsError(true);
                    showError('Email already exists, try another!');
                } else {
                    console.error(`Registration Failed: ${errorMessage}`);
                }
                console.error('Registration Error (Server):', errorMessage);
            }
        } catch (error) {
            console.error('Connection/Network Error:', error);
            showError('Connection or network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // =================================================================
    // 6. LÓGICA DE CLASES Y COLORES
    // =================================================================

    // Determina la clase CSS del input (verde, rojo o normal)
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
            // Rojo si hay error de unicidad O (formato inválido Y ha sido tocado)
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
        const showError = hasError && (inputValue !== '' || usernameExistsError || emailExistsError);

        return showError ? '#fcc4c4' : 'inherit';
    };

    // Lógica para el texto de las etiquetas de ayuda: Muestra error de unicidad o formato en tiempo real.
    const getLabelText = (inputName) => {
        let isValidState = null;
        let inputValue = '';
        let isUnicityError = false;

        if (inputName === 'username') {
            isValidState = usernameValid;
            inputValue = username;
            isUnicityError = usernameExistsError;

            // 1. PRIORIDAD MÁXIMA: Error de Unicidad
            if (isUnicityError) return 'Username already exists, try another!';

            // 3. DEFAULT
            return 'Min 5, max 20 chars (letters, numbers, _)';
        }

        if (inputName === 'email') {
            isValidState = emailValid;
            inputValue = email;
            isUnicityError = emailExistsError;

            // 1. PRIORIDAD MÁXIMA: Error de Unicidad
            if (isUnicityError) return 'Email already exists, try another!';

            // 3. DEFAULT
            return 'Format: example@domain.com';
        }

        if (inputName === 'password') {
            isValidState = passwordValid;
            inputValue = password;
            if (isValidState === false && inputValue !== '' && touched.password) {
                return 'Min 8 chars (Incl. 1 upper, 1 lower, 1 num)';
            }
            return 'Min 8 chars (Incl. 1 upper, 1 lower, 1 num)';
        }

        if (inputName === 'repeatPassword') {
            isValidState = repeatPasswordValid;
            inputValue = repeatPassword;
            if (isValidState === false && inputValue !== '' && touched.repeatPassword) {
                return 'Must match the password field.';
            }
            return 'Confirm your password';
        }

        return '';
    }

    // Calcula si el formulario es válido (Memorizado para optimización)
    const isFormValid = useMemo(() => {
        const allFieldsFilled = username.length > 0 && email.length > 0 && password.length > 0 && repeatPassword.length > 0;

        return allFieldsFilled &&
            validateUsername(username) &&
            validateEmail(email) &&
            validatePassword(password) &&
            validateRepeatPassword(repeatPassword) &&
            !usernameExistsError && // Importante: no enviar si hay error de unicidad
            !emailExistsError && // Importante: no enviar si hay error de unicidad
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

            {/* FEEDBACK USERNAME */}
            <label
                htmlFor="text"
                style={{
                    color: getLabelColor('username'), // Color dinámico (rojo si hay error)
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

            {/* FEEDBACK EMAIL */}
            <label
                htmlFor="email"
                style={{
                    color: getLabelColor('email'), // Color dinámico (rojo si hay error)
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
                        // Marca como tocado al salir del foco para mostrar feedback de formato
                        onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                        onChange={handlePasswordChange}
                        required
                        autoComplete="new-password"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            {/* FEEDBACK PASSWORD */}
            <label
                htmlFor="password"
                style={{
                    color: getLabelColor('password'), // Color dinámico (rojo si hay error)
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
                        // Marca como tocado al salir del foco para mostrar feedback de formato
                        onBlur={() => setTouched(prev => ({ ...prev, repeatPassword: true }))}
                        onChange={handleRepeatPasswordChange}
                        required
                        autoComplete="new-password"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            {/* FEEDBACK REPEAT PASSWORD */}
            <label
                htmlFor="repeat-password"
                style={{
                    color: getLabelColor('repeatPassword'), // Color dinámico (rojo si hay error)
                }}
            >
                {getLabelText('repeatPassword')}
            </label>

            <button type="submit" className="register-btn" disabled={!isFormValid}>
                {isSubmitting ? 'Loading...' : 'Sign Up'}
            </button>
        </form>
    );
};

export default SignupForm;