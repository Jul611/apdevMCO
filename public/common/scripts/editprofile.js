const editProfileBtn = document.getElementById('edit-profile-btn');
const modal = document.getElementById('edit-profile-modal');
const closeModal = document.querySelector('.close');
const editProfileForm = document.getElementById('edit-profile-form');

editProfileBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(editProfileForm);
    
    try {
        const response = await fetch('/editprofile', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        // Optionally, handle success message or redirect
        modal.style.display = 'none';
        window.location.reload(); // Refresh the page or update UI dynamically
    } catch (error) {
        console.error('Error updating profile:', error);
        // Handle error (e.g., display error message)
    }
});