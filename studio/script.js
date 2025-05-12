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

    const applyButton = document.getElementById('applyButton');

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

/* Hide/Show Sections */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .primary-nav .nav-link');
    const contentSections = document.querySelectorAll('aside > .container');
    const storeButton = document.getElementById('storeButton');

    navLinks.forEach((link, index) => {
        link.addEventListener('click', () => {
            // Deactivate all nav links
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            // Hide all content sections
            contentSections.forEach(section => section.classList.add('hide'));

            if (contentSections[index]) {
                contentSections[index].classList.remove('hide');
            }
        });
    })

    if (storeButton) {
        storeButton.addEventListener('click', () => {

            const storeNavLinkIndex = 4;

            const storeNavLink = navLinks[storeNavLinkIndex];
            const storeContentSection = contentSections[storeNavLinkIndex];

            // Deactivate all nav links
            if (storeNavLink && storeContentSection) {
                navLinks.forEach(nav => nav.classList.remove('active'));
                storeNavLink.classList.add('active');
                
                // Hide all content sections
                contentSections.forEach(section => section.classList.add('hide'));
                storeContentSection.classList.remove('hide');
            }
        });
    }
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
    checkMonetizationEligibility(); 
});