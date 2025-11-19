
import { IoIosCloseCircle } from "react-icons/io";
import { API_URL } from "../../../../../config";

const ModalDeleteAccount = ({ onClose }) => {
    async function handleDeleteAccount() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            alert('User ID not found. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
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
        <div className="create-store-modal">
            <div className="create-delete-content">
                <header>
                    <h1>Delete account</h1>
                    <button type="button" onClick={onClose} className="close-create-store-modal">
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>
                <main>
                    <h1>Are you sure you want to delete your account?</h1>
                    <button className="delete-account" onClick={handleDeleteAccount}>Permanently Delete</button>
                </main>
            </div>
        </div>
    );
};

export default ModalDeleteAccount;
