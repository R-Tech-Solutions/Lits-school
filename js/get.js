document.getElementById('admissionForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // Include academic details explicitly
    formObject.academicDetails = {
        schoolName: formData.get('schoolName'),
        class: formData.get('class'),
        section: formData.get('section'),
    };

    // Show SweetAlert2 loader
    Swal.fire({
        title: 'Submitting...',
        text: 'Please wait while we process your admission.',
        imageUrl: '../images/loader.gif', // Use your loader image
        imageWidth: 100,
        imageHeight: 100,
        showConfirmButton: false,
        allowOutsideClick: false,
    });

    // Send data to the backend
    try {
        const response = await fetch('/api/submit-admission', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),
        });

        const result = await response.json();
        if (result.success) {
            // Success alert
            Swal.fire({
                title: 'Success!',
                text: 'Your form has been submitted successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
            }).then(() => {
                // Reset form fields
                document.getElementById('admissionForm').reset();
            });
        } else {
            // Error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was an error submitting the form. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK',
        });
    }
});
