import React, { useState } from 'react';
import { useModal } from "../../ModalContext";
import { useToast } from '../../../../../hooks/useToast';
import { VITE_API_URL } from "../../../../../../config"

// =================================================================
// 1. CONSTANTE DE VALIDACIÓN IMPORTADA (DEBE ESTAR FUERA DEL COMPONENTE)
// =================================================================

// Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/;

// Función de validación de formato
const validatePassword = (value) => PASSWORD_REGEX.test(value);

const AccountSettings = () => {
  const { openModal } = useModal();
  const { showSuccess, showError } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de validación
  const [newPasswordValid, setNewPasswordValid] = useState(true);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);

  // =================================================================
  // HANDLERS DE CAMBIO (VALIDACIÓN EN TIEMPO REAL BÁSICA)
  // =================================================================

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const validFormat = validatePassword(value);
    setNewPasswordValid(validFormat);
    // Revalidar confirmación inmediatamente
    setConfirmPasswordValid(value === confirmPassword && validFormat);
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    // La validación depende del nuevo valor y del newPassword (ya validado en formato)
    setConfirmPasswordValid(value === newPassword && newPasswordValid);
  };

  // =================================================================
  // LÓGICA DE SUBMISIÓN CON VALIDACIÓN COMPLETA
  // =================================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // 1. Validar el formato de la nueva contraseña
    const isNewPasswordFormatValid = validatePassword(newPassword);
    setNewPasswordValid(isNewPasswordFormatValid);

    // 2. Validar que la confirmación coincida y el formato sea correcto
    const isConfirmPasswordMatch = newPassword === confirmPassword;
    const isConfirmPasswordValid = isConfirmPasswordMatch && isNewPasswordFormatValid;
    setConfirmPasswordValid(isConfirmPasswordValid);

    // 3. Verificar errores antes de enviar
    if (!isNewPasswordFormatValid) {
      showError("The new password does not meet the required format (Min 8 chars: 1 upper, 1 lower, 1 num).");
      return;
    }
    if (!isConfirmPasswordMatch) {
      showError("The new password and confirmation password do not match.");
      return;
    }

    // 4. Si es válido, proceder con el envío
    try {
      // ... (Lógica de fetch idéntica a la tuya)
      const response = await fetch(`${VITE_API_URL}/users/me/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        showSuccess("Password changed successfully.");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        showError(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error(error);
      showError("An error occurred.");
    }
  };

  const handleDeleteClick = () => {
    openModal('delete-account');
  };
  
  // Lógica para determinar la clase CSS
  const getInputClass = (isValid) => {
      // Solo mostramos feedback si el usuario ha escrito algo
      if (isValid === false) return 'incorrect-input';
      if (isValid === true) return 'correct-input';
      return ''; // Clase por defecto
  }

  // Lógica para determinar si el botón debe estar deshabilitado
  const isFormValid = currentPassword.length > 0 && 
                      newPassword.length > 0 && 
                      confirmPassword.length > 0 && 
                      newPasswordValid && 
                      confirmPasswordValid;


  return (
    <section className="setting-section">
      <h2>Account</h2>
      <form className="change-password-form" onSubmit={handleChangePassword}>
        <label htmlFor="current-password">Current Password:</label>
        <input
          type="password"
          id="current-password"
          placeholder="Current password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          // La validación de la contraseña actual es responsabilidad del backend
        />
        <a type="button" onClick={() => openModal("reset-password")}>
          I forgot my password
        </a>

        <label htmlFor="new-password">New Password:</label>
        <input
          type="password"
          id="new-password"
          placeholder="New password"
          required
          value={newPassword}
          onChange={handleNewPasswordChange} // Usar el handler con validación
          className={newPassword.length > 0 ? getInputClass(newPasswordValid) : ''}
          autoComplete="new-password"
        />
        {/* Mostrar feedback de error de formato */}
        {newPasswordValid === false && newPassword.length > 0 && (
            <p style={{ color: '#fcc4c4', marginTop: '-10px' }}>
                Min 8 chars (Incl. 1 upper, 1 lower, 1 num)
            </p>
        )}
        {/* Muestra el requisito si no hay error */}
        {(newPasswordValid === true || newPassword.length === 0) && (
            <p>Min 8 characters, incl. upper, lower, num</p>
        )}

        <label htmlFor="confirm-new-password">Confirm New Password:</label>
        <input
          type="password"
          id="confirm-new-password"
          placeholder="Confirm new password"
          required
          value={confirmPassword}
          onChange={handleConfirmPasswordChange} // Usar el handler con validación
          className={confirmPassword.length > 0 ? getInputClass(confirmPasswordValid) : ''}
          autoComplete="new-password"
        />
        {/* Mostrar feedback de error de coincidencia */}
        {confirmPasswordValid === false && confirmPassword.length > 0 && (
            <p style={{ color: '#fcc4c4', marginTop: '-10px' }}>
                Must match the new password.
            </p>
        )}

        <div className="setting-section-btn-container">
          <button type="submit" className="soon" disabled={!isFormValid}>Change</button>

          <button
            type="button"
            className="delete-account-btn"
            onClick={handleDeleteClick}
          >
            Delete Account
          </button>
        </div>
      </form>
    </section>
  );
}

export default AccountSettings;