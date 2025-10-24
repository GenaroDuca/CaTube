
import { IoIosCloseCircle } from "react-icons/io";

const ModalDeleteAccount = ({ onClose }) => {
    async function handleDeleteAccount() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            alert('User ID not found. Please log in again.');
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
                alert('Account deleted successfully.');
                localStorage.clear();
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                alert(`Failed to delete account: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            alert('Error deleting account. Please try again later.');
            console.error('Delete account error:', error);
        }
    }

    return (
        <div className="delete-account-modal">
            <div className="delete-account-modal-content">
                <header>
                    <h1>Delete account</h1>
                    <button type="button" onClick={onClose} className="close-create-store-modal">
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>
                <main>
                    <h3>Are you sure you want to delete your account?</h3>
                    <button className="delete-account-btn" onClick={handleDeleteAccount}>Permanently Delete</button>
                    <h4>This action is irreversible</h4>
                </main>
            </div>
        </div>
    );
};

export default ModalDeleteAccount;
