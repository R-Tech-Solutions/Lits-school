document.getElementById('admissionForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
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

    // Send data to the backend
    try {
        const response = await fetch('http://localhost:3000/submit-admission', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject), // Send form data as JSON
        });

        const result = await response.json();
        if (result.success) {
            alert('Form submitted successfully!');
        } else {
            alert('There was an error submitting the form.');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
