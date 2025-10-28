import { useModal } from "../../ModalContext";
import { useNotifications } from '../../../Toasts/useNotifications';

const AccountSettings = () => {
  const { openModal } = useModal();
  // FeedbackToast y Modal Context
  const { showSuccess, showError } = useNotifications();

  // 1. Mover la lógica de borrado de cuenta del modal viejo aquí
  const deleteUserAccount = async () => {
    let userId = localStorage.getItem('userId');

    if (!userId) {
      console.error('User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        // Mostrar una alerta o toast de éxito y luego redirigir
        showError('Account deleted successfully. Goodbye!');
        localStorage.clear();
        window.location.href = '/'; // Redirigir a la página de inicio o login
      } else {
        const errorData = await response.json();
        alert(`Failed to delete account: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      alert('Error deleting account. Please try again later.');
      console.error('Delete account error:', error);
    }
  };


  // 2. Definir los parámetros del modal para borrar cuenta
  const handleDeleteClick = () => {
    openModal('confirm', {
      title: "Delete Account",
      message: "Are you absolutely sure you want to permanently delete your account?",
      confirmText: "Yes, Delete Permanently",
      onConfirm: deleteUserAccount,
      buttonClass: "delete-account-btn"
    });
  };

  return (
    <section className="setting-section">
      <h2>Account Settings</h2>
      <form className="change-password-form">
        <label htmlFor="current-password">Current Password:</label>
        <input type="password" id="current-password" placeholder="Current password" required />
        <a href="#">Forgot your password?</a>

        <label htmlFor="new-password">New Password:</label>
        <input type="password" id="new-password" placeholder="New password" required />
        <p>Min 8 characters, incl. upper, lower, num, symbol</p>

        <label htmlFor="confirm-new-password">Confirm New Password:</label>
        <input type="password" id="confirm-new-password" placeholder="Confirm new password" required />

        <button type="submit" className="soon">Change Password</button>
      </form>

      <div className="setting-section-btn-container">
        <button type="button" className="disable-account-btn soon">Disable Account</button>

        {/* Usar la nueva función handleDeleteClick que abre el modal universal */}
        <button
          type="button"
          className="delete-account-btn"
          onClick={handleDeleteClick}
        >
          Delete Account
        </button>
      </div>
    </section>
  );
}

export default AccountSettings;