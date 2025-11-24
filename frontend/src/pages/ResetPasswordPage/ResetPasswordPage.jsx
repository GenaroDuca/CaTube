import React, { useState, useMemo } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "../../hooks/useToast.jsx";
import './ResetPasswordPage.css';
import { VITE_API_URL } from '../../../config';

// ============================================================
// VALIDACIÓN DE PASSWORD (igual que en SignupForm)
// ============================================================
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [passwordValid, setPasswordValid] = useState(null);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(null);
    const [touched, setTouched] = useState({ password: false, confirmPassword: false });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    // ============================================================
    // VALIDACIONES
    // ============================================================
    const validatePassword = (value) => PASSWORD_REGEX.test(value);
    const validateConfirmPassword = (value) =>
        value === password && validatePassword(password);

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        const valid = validatePassword(value);
        setPasswordValid(valid);
        const confirmValid = confirmPassword === value && valid;
        setConfirmPasswordValid(confirmValid);
        if (!touched.password) setTouched(prev => ({ ...prev, password: true }));
    };

    const handleConfirmChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setConfirmPasswordValid(validateConfirmPassword(value));
        if (!touched.confirmPassword) setTouched(prev => ({ ...prev, confirmPassword: true }));
    };

    // ============================================================
    // ENVÍO
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
            showError("Missing token in URL.");
            return;
        }

        if (!validatePassword(password)) {
            showError("Invalid password format. Min 8 chars, incl. upper, lower & number.");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(`${VITE_API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const result = await response.json();

            if (response.ok) {
                showSuccess("Password reset successfully. Redirecting to login...");
                setPassword("");
                setConfirmPassword("");

                setTimeout(() => {
                    navigate("/register");
                }, 2500);
            } else {
                showError(result.message || "Error resetting password.");
            }
        } catch (error) {
            showError("Server connection error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================================
    // CLASES Y FEEDBACK VISUAL
    // ============================================================
    const getInputClass = (type) => {
        const isValid = type === 'password' ? passwordValid : confirmPasswordValid;
        const isTouched = type === 'password' ? touched.password : touched.confirmPassword;
        const value = type === 'password' ? password : confirmPassword;

        if (!isTouched || value === '') return 'input';
        return isValid ? 'input correct-input' : 'input incorrect-input';
    };

    const getLabelColor = (type) => {
        const isValid = type === 'password' ? passwordValid : confirmPasswordValid;
        const isTouched = type === 'password' ? touched.password : touched.confirmPassword;
        const value = type === 'password' ? password : confirmPassword;

        if (isTouched && value !== '' && !isValid) return '#fcc4c4';
        return 'inherit';
    };

    const getLabelText = (type) => {
        if (type === 'password') {
            return 'Min 8 chars (Incl. 1 upper, 1 lower, 1 num)';
        }
        if (type === 'confirm') {
            if (touched.confirmPassword && !confirmPasswordValid)
                return 'Must match the password field.';
            return 'Confirm your password';
        }
        return '';
    };

    const isFormValid = useMemo(() =>
        validatePassword(password) && validateConfirmPassword(confirmPassword)
        , [password, confirmPassword]);

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="reset-password-page">
            <div style={{ textAlign: 'center' }}>
                <img
                    style={{ width: "100px", marginTop: "-10px" }}
                    src="catube_white.png"
                    alt="CaTube Logo"
                />
                <h1>Reset Your Password!</h1>
                <h2 style={{ color: '#90b484' }}>Write it down on a piece of paper 😼</h2>

                <form onSubmit={handleSubmit} className="reset-password-form">

                    {/* PASSWORD */}
                    <input
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                        required
                    />
                    <label
                        htmlFor="password"
                        style={{ color: getLabelColor('password') }}
                    >
                        {getLabelText('password')}
                    </label>

                    {/* CONFIRM PASSWORD */}
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={handleConfirmChange}
                        onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                        required
                    />
                    <label
                        htmlFor="confirm"
                        style={{ color: getLabelColor('confirm') }}
                    >
                        {getLabelText('confirm')}
                    </label>

                    {/* BOTÓN */}
                    <button
                        type="submit"

                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? "Loading..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};
