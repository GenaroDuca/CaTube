function updateProgressBar(currentValue, maxValue, progressBarFillId, startLabelId, endLabelId) {
    // Validate values
    if (currentValue < 0) currentValue = 0;
    if (currentValue > maxValue) currentValue = maxValue;

    const percentage = (currentValue / maxValue) * 100;

    const progressBarFill = document.getElementById(progressBarFillId);


    if (progressBarFill) {
        progressBarFill.style.width = percentage + '%';
        progressBarFill.textContent = currentValue;
    }
}

// Monetization Requirements Data

// Subscribers
const currentSubscribers = 20;
const maxSubscribers = 500;

// Videos Uploaded 
const currentVideosUploaded = 2;
const maxVideosUploaded = 3;

// Public Watch Hours
const currentWatchHours = 450;
const maxWatchHours = 3000;


function checkMonetizationEligibility() {
    const subscribersMet = currentSubscribers >= maxSubscribers;
    const videosUploadedMet = currentVideosUploaded >= maxVideosUploaded;
    const watchHoursMet = currentWatchHours >= maxWatchHours;

    const applyButton = document.getElementById('applyButton'); // Make sure your button has id="applyButton"

    if (applyButton) {
        if (subscribersMet && videosUploadedMet && watchHoursMet) {
            applyButton.disabled = false;
            console.log("All primary requirements met. Apply button enabled.");
        } else {
            applyButton.disabled = true;
            console.log("Not all primary requirements met. Apply button disabled.");
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    updateProgressBar(currentSubscribers, maxSubscribers, 'subscribersProgressBarFill', 'subscribersProgressStartLabel', 'subscribersProgressEndLabel');
    updateProgressBar(currentVideosUploaded, maxVideosUploaded, 'videosUploadedProgressBarFill', 'videosUploadedProgressStartLabel', 'videosUploadedProgressEndLabel');
    updateProgressBar(currentWatchHours, maxWatchHours, 'watchHoursProgressBarFill', 'watchHoursProgressStartLabel', 'watchHoursProgressEndLabel');

    checkMonetizationEligibility();
});

/* Hide/Show Sections */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .primary-nav .nav-link');
    const contentSections = document.querySelectorAll('aside > .container'); // Assuming containers are direct children of aside

    navLinks.forEach((link, index) => {
        link.addEventListener('click', () => {
            // Remove active class from all links
            navLinks.forEach(nav => nav.classList.remove('active'));
            // Add active class to the clicked link
            link.classList.add('active');

            // Hide all content sections
            contentSections.forEach(section => section.classList.add('hide'));
            // Show the corresponding content section
            if (contentSections[index]) {
                contentSections[index].classList.remove('hide');
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', function () {
    // Setup navigation
    setupNavigation();

    // Update progress bars
    updateProgressBar(currentSubscribers, maxSubscribers, 'subscribersProgressBarFill', 'subscribersProgressStartLabel', 'subscribersProgressEndLabel');
    updateProgressBar(currentVideosUploaded, maxVideosUploaded, 'videosUploadedProgressBarFill', 'videosUploadedProgressStartLabel', 'videosUploadedProgressEndLabel');
    updateProgressBar(currentWatchHours, maxWatchHours, 'watchHoursProgressBarFill', 'watchHoursProgressStartLabel', 'watchHoursProgressEndLabel');
    updateProgressBar(currentShortsViews, maxShortsViews, 'shortsViewsProgressBarFill', 'shortsViewsProgressStartLabel', 'shortsViewsProgressEndLabel');

    // Check monetization eligibility
    checkMonetizationEligibility(); // Check eligibility and update button state
});