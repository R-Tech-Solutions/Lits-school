const coursesContainer = document.getElementById("courses-container");

// Function to generate courses dynamically
async function renderCourses() {
    try {
        const response = await fetch('http://localhost:3000/api/courses');
        const courses = await response.json();

        courses.forEach((course) => {
            // Create a course card
            const card = document.createElement("div");
            card.className = "course-card";

            // Add course icon
            const icon = document.createElement("div");
            icon.className = "course-icon";
            icon.innerHTML = "📘"; // Static icon
            card.appendChild(icon);

            // Add course title
            const title = document.createElement("h3");
            title.className = "course-title";
            title.innerText = course.title;
            card.appendChild(title);

            // Add course description
            const description = document.createElement("p");
            description.className = "course-description";
            description.innerText = course.description;
            card.appendChild(description);

            // Append card to the container
            coursesContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Render the courses
renderCourses();


function startCarousel() {
    const carouselTrack = document.getElementById('carousel-track');
    const carouselItems = Array.from(carouselTrack.children);


    const itemWidth = carouselItems[0].offsetWidth;
    const visibleItemsCount = Math.ceil(window.innerWidth / itemWidth);

  
    for (let i = 0; i < visibleItemsCount; i++) {
        const clone = carouselItems[i % carouselItems.length].cloneNode(true);
        carouselTrack.appendChild(clone);
    }

    let scrollAmount = 0;
    let totalItems = carouselItems.length + visibleItemsCount;

    setInterval(() => {
        scrollAmount += itemWidth;
        carouselTrack.style.transition = "transform 0.5s ease";
        carouselTrack.style.transform = `translateX(-${scrollAmount}px)`;

       
        if (scrollAmount >= itemWidth * carouselItems.length) {
            setTimeout(() => {
                carouselTrack.style.transform = `translateX(0)`;
                scrollAmount = 0;
            }, 500); 
        }
    }, 3000); 
}


async function fetchLectures() {
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');

    try {
        const response = await fetch('/api/lectures');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lectures = await response.json();
        renderLectures(lectures);
        startCarousel(); 
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loader.classList.add('hidden');
    }
}

function renderLectures(lectures) {
    const carouselTrack = document.getElementById('carousel-track');
    carouselTrack.innerHTML = ''; 

    lectures.forEach((lecture) => {
       
        const lectureItem = document.createElement('div');
        lectureItem.className = 'carousel-item';

       
        const lectureImage = document.createElement('img');
        lectureImage.className = 'lecture-image';
        lectureImage.src = lecture.imageUrl; 
        lectureImage.alt = lecture.name; 

        const lectureName = document.createElement('h3');
        lectureName.className = 'lecture-name';
        lectureName.innerText = lecture.name;

        const lecturePosition = document.createElement('p');
        lecturePosition.className = 'lecture-position';
        lecturePosition.innerText = lecture.position;


        lectureItem.appendChild(lectureImage);
        lectureItem.appendChild(lectureName); 
        lectureItem.appendChild(lecturePosition); 


        carouselTrack.appendChild(lectureItem);
    });
}


document.addEventListener('DOMContentLoaded', fetchLectures);

