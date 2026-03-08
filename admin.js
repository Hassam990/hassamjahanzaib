document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api/cases';

    const casesTableBody = document.getElementById('casesTableBody');
    const modal = document.getElementById('caseModal');
    const addCaseBtn = document.getElementById('addCaseBtn');
    const closeBtn = document.querySelector('.close-btn');
    const caseForm = document.getElementById('caseForm');
    const toast = document.getElementById('toast');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');

    let isEditing = false;
    let existingImagesArray = [];

    // Fetch and display cases
    const loadCases = async () => {
        try {
            const res = await fetch(API_URL);
            const cases = await res.json();
            renderTable(cases);
        } catch (error) {
            showToast('Error loading cases. Is the server running?');
            console.error(error);
        }
    };

    const renderTable = (cases) => {
        casesTableBody.innerHTML = '';
        cases.forEach(c => {
            const tr = document.createElement('tr');
            const mainImg = c.images && c.images.length > 0 ? c.images[0] : 'assets/placeholder.jpg';

            tr.innerHTML = `
                <td><img src="${mainImg}" alt="${c.title}"></td>
                <td><strong>${c.title}</strong></td>
                <td>${c.category}</td>
                <td class="action-btns">
                    <button class="btn btn-edit" onclick="editCase('${c.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteCase('${c.id}')">Delete</button>
                </td>
            `;
            casesTableBody.appendChild(tr);
        });
    };

    // Modal Operations
    addCaseBtn.onclick = () => {
        isEditing = false;
        caseForm.reset();
        document.getElementById('caseId').value = '';
        document.getElementById('modalTitle').innerText = 'Add New Case';
        imagePreviewContainer.innerHTML = '';
        existingImagesArray = [];
        modal.style.display = 'block';
    };

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Form Submit (Add/Edit)
    caseForm.onsubmit = async (e) => {
        e.preventDefault();

        const saveBtn = document.getElementById('saveCaseBtn');
        saveBtn.innerText = 'Saving...';
        saveBtn.disabled = true;

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('link', document.getElementById('link').value);
        formData.append('description', document.getElementById('description').value);

        // Append existing images if editing
        if (isEditing) {
            existingImagesArray.forEach(img => {
                formData.append('existingImages', img);
            });
        }

        // Append new images
        const fileInput = document.getElementById('images');
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append(isEditing ? 'newImages' : 'images', fileInput.files[i]);
        }

        const method = isEditing ? 'PUT' : 'POST';
        const id = document.getElementById('caseId').value;
        const url = isEditing ? `${API_URL}/${id}` : API_URL;

        try {
            const res = await fetch(url, {
                method: method,
                body: formData
            });

            if (res.ok) {
                showToast(`Case ${isEditing ? 'updated' : 'added'} successfully!`);
                modal.style.display = 'none';
                loadCases();
            } else {
                throw new Error('Server returned an error');
            }
        } catch (error) {
            showToast(`Error ${isEditing ? 'updating' : 'adding'} case.`);
            console.error(error);
        } finally {
            saveBtn.innerText = 'Save Case';
            saveBtn.disabled = false;
        }
    };

    // Edit Case (Global function so inline onclick works)
    window.editCase = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`);
            const caseData = await res.json();

            isEditing = true;
            document.getElementById('modalTitle').innerText = 'Edit Case';
            document.getElementById('caseId').value = caseData.id;
            document.getElementById('title').value = caseData.title;
            document.getElementById('category').value = caseData.category;
            document.getElementById('link').value = caseData.link;
            document.getElementById('description').value = caseData.description || '';
            document.getElementById('images').value = ''; // Reset file input

            // Render existing images
            existingImagesArray = caseData.images || [];
            renderExistingImages();

            modal.style.display = 'block';
        } catch (error) {
            showToast('Error fetching case details.');
            console.error(error);
        }
    };

    const renderExistingImages = () => {
        imagePreviewContainer.innerHTML = '';
        existingImagesArray.forEach((imgPath, index) => {
            const wrap = document.createElement('div');
            wrap.className = 'image-preview-wrap';
            wrap.innerHTML = `
                <img src="${imgPath}" alt="Preview">
                <button type="button" class="remove-preview-btn" onclick="removeExistingImage(${index})">&times;</button>
            `;
            imagePreviewContainer.appendChild(wrap);
        });
    };

    window.removeExistingImage = (index) => {
        existingImagesArray.splice(index, 1);
        renderExistingImages();
    };

    // Delete Case (Global function)
    window.deleteCase = async (id) => {
        if (confirm('Are you sure you want to delete this case?')) {
            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    showToast('Case deleted successfully!');
                    loadCases();
                } else {
                    throw new Error('Failed to delete');
                }
            } catch (error) {
                showToast('Error deleting case.');
                console.error(error);
            }
        }
    };

    // Toast Utility
    const showToast = (message) => {
        toast.innerText = message;
        toast.className = "toast show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    };

    // Initial load
    loadCases();
});
