# JobHunt
Custom Job Search App I have verified that the Custom Job Search App is fully functional. It successfully connects to the Adzuna API, retrieves real job listings, and allows users to save their favorite roles.

Features Verified
1. Job Search
Test: Searched for "Software Engineer" in "London".
Result: The app successfully fetched and displayed relevant job cards from the Adzuna API.
UI: Job cards display title, company, location, salary, and description.
2. Saving Jobs
Test: Clicked the "Star" icon on a job card.
Result: The job was instantly saved. The icon turned yellow/gold.
Persistence: Saved jobs appear in the "Saved Jobs" modal even after navigating.
3. Responsive Design & Themes
Test: Verified the layout adapts to different screen sizes.
Test: Toggled Dark Mode (🌙/☀️) successfully.
Verification Recording
I performed an automated browser test to confirm these flows.

Browser Verification

Next Steps
Open 
index.html
 in your browser to start using the app!
You can customize the 
app.js
 file to add more filters or change the default country.
