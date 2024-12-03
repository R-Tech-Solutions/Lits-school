document.getElementById('admissionForm').addEventListener('submit', async function(event) {
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
            alert('Form submitted successfully!');
        } else {
            alert('There was an error submitting the form.');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
