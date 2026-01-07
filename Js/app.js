// Constants
// const ADZUNA_APP_ID = '16879a4f';
// const ADZUNA_APP_KEY = '491880577202054840ff8523cb7ffd88';
const ADZUNA_APP_ID = 'YOUR_APP_ID';
const ADZUNA_APP_KEY = 'YOUR_APP_KEY';
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
// State
let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
let currentCountry = 'gb';
// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const locationInput = document.getElementById('location-input');
const jobsContainer = document.getElementById('jobs-container');
const themeToggle = document.getElementById('theme-toggle');
const countrySelect = document.getElementById('country-select');
const savedJobsBtn = document.getElementById('saved-jobs-btn');
const savedJobsModal = document.getElementById('saved-jobs-modal');
const closeModalBtn = document.querySelector('.close-modal');
const savedJobsList = document.getElementById('saved-jobs-list');
const loadingSpinner = document.getElementById('loading-spinner');
// Theme Management
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});
// Event Listeners
searchForm.addEventListener('submit', handleSearch);
countrySelect.addEventListener('change', (e) => currentCountry = e.target.value);
savedJobsBtn.addEventListener('click', openSavedJobs);
closeModalBtn.addEventListener('click', () => savedJobsModal.classList.add('hidden'));
// Search Handler
async function handleSearch(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    const location = locationInput.value.trim();
    const isRemote = document.getElementById('remote-checkbox').checked;
    if (!query) return;
    showLoading(true);
    jobsContainer.innerHTML = ''; // Clear previous results
    try {
        // Construct API URL
        // Append "remote" to query if checked
        let outputQuery = query;
        if (isRemote) {
            outputQuery += ' remote';
        }
        const url = `${BASE_URL}/${currentCountry}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=20&what=${encodeURIComponent(outputQuery)}&where=${encodeURIComponent(location)}&content-type=application/json`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('API Request Failed');
        }
        const data = await response.json();
        renderJobs(data.results);
    } catch (error) {
        console.error('Search error:', error);
        jobsContainer.innerHTML = `<div class="error-state">
            <p>Failed to fetch jobs. Please check your API credentials or try again later.</p>
            <p style="font-size: 0.8rem; color: #666;">(Note: You need to replace YOUR_APP_ID and YOUR_APP_KEY in app.js)</p>
        </div>`;
    } finally {
        showLoading(false);
    }
}
// Render Jobs
function renderJobs(jobs) {
    if (!jobs || jobs.length === 0) {
        jobsContainer.innerHTML = '<div class="empty-state"><p>No jobs found. Try adjusting your search.</p></div>';
        return;
    }
    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';
        const isSaved = savedJobs.some(saved => saved.id === job.id);
        card.innerHTML = `
            <h3 class="job-role">${job.title}</h3>
            <div class="job-company">${job.company.display_name}</div>
            <div class="job-location">📍 ${job.location.display_name}</div>
            <div class="job-salary">💰 ${formatSalary(job)}</div>
            <p class="job-description">${job.description}</p>
            <div class="job-footer">
                <a href="${job.redirect_url}" target="_blank" class="view-btn">View Details -></a>
                <button class="save-btn ${isSaved ? 'saved' : ''}" onclick="toggleSaveJob('${job.id}')">
                    ${isSaved ? '★' : '☆'}
                </button>
            </div>
        `;
        // Store job data in DOM element for easy access in toggleSaveJob (or use a Map)
        // For simplicity, we'll re-fetch or pass data differently, but let's just attach it to the button for now via closure or simpler:
        // We'll attach the full job object to a global map or simply use the ID to find it if we had the list. 
        // A better way for vanilla JS without frameworks:
        card.querySelector('.save-btn').onclick = () => toggleSaveJob(job);
        jobsContainer.appendChild(card);
    });
}
function formatSalary(job) {
    if (job.salary_min && job.salary_max) {
        return `£${Math.floor(job.salary_min)} - £${Math.floor(job.salary_max)}`;
    }
    return 'Salary not specified';
}
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}
// Saved Jobs Logic
function toggleSaveJob(job) {
    const index = savedJobs.findIndex(j => j.id === job.id);
    if (index === -1) {
        savedJobs.push(job);
        alert('Job saved!');
    } else {
        savedJobs.splice(index, 1);
        alert('Job removed from saved!');
    }
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    // Refresh UI if needed (re-render searching results to update stars)
    // For now, we manually update the button class clicked
    const btn = event.target; // This might be tricky with the closure above. 
    // Let's just re-render the list if we are in search view.
    // Ideally we update the specific button state.
    if (btn) {
        btn.textContent = index === -1 ? '★' : '☆';
        btn.classList.toggle('saved');
    }
    // If modal is open, refresh it
    if (!savedJobsModal.classList.contains('hidden')) {
        renderSavedJobs();
    }
}
function openSavedJobs() {
    savedJobsModal.classList.remove('hidden');
    renderSavedJobs();
}
function renderSavedJobs() {
    savedJobsList.innerHTML = '';
    if (savedJobs.length === 0) {
        savedJobsList.innerHTML = '<p>No saved jobs yet.</p>';
        return;
    }
    savedJobs.forEach(job => {
        const item = document.createElement('div');
        item.className = 'job-card'; // Reuse style
        item.style.marginBottom = '1rem';
        item.innerHTML = `
            <h3 class="job-role">${job.title}</h3>
            <div class="job-company">${job.company.display_name}</div>
            <div class="job-footer">
                <a href="${job.redirect_url}" target="_blank" class="view-btn">View</a>
                <button class="save-btn saved" onclick="removeSavedJob('${job.id}')">★ Remove</button>
            </div>
        `;
        // Fix onclick closure issue again
        item.querySelector('.save-btn').onclick = () => {
            toggleSaveJob(job); // This will toggle it OFF
            renderSavedJobs(); // Re-render list
        };
        savedJobsList.appendChild(item);
    });
}
// Initial check
console.log('JobHunt App Loaded');