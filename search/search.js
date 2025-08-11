'use strict';
document.addEventListener('DOMContentLoaded', () => {

    const categoryFilter = ['recommendations', 'channel-results', 'short-results', 'playlist-results'];

    function removeSoonClassWhenReady() {
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.classList.remove('soon');
        } else {
            setTimeout(removeSoonClassWhenReady, 100); // Vuelve a intentar en 100ms
        }
    }
    
    removeSoonClassWhenReady();

    // --- HANDLING CLICKS ON FILTER BUTTONS (WITH EVENT DELEGATION) ---
    document.addEventListener('click', function (event) {
        // Check if the clicked element (or its parent) is a filter button
        const clickedBtn = event.target.closest('.filter-search-btn');

        if (clickedBtn) { // If a filter button was clicked...
            // Get all filter buttons to remove the 'active' class from them
            const allFilterButtons = document.querySelectorAll('.filter-search-btn');
            allFilterButtons.forEach(b => b.classList.remove('active'));

            // Add the 'active' class only to the button that was clicked
            clickedBtn.classList.add('active');

            // Apply the filter
            applyFilter();
        }
    });


    // --- HANDLING INPUT IN THE SEARCH FIELD (WITH EVENT DELEGATION) ---
    document.addEventListener('input', function (event) {
        // Check if the input event occurred on our searchInput element
        if (event.target.matches('#searchInput')) {
            applyFilter();
        }
    });


    // --- FUNCTION TO APPLY THE FILTER (MODIFIED TO BE SAFE) ---
    function applyFilter() {

        // This ensures they already exist in the DOM when the function is called.
        const searchInput = document.querySelector('#searchInput');
        const searchResults = document.querySelector('.search-results');
        const activeButton = document.querySelector('.filter-search-btn.active');

        // Safety check: if the main elements don't exist, do nothing to prevent errors.
        if (!searchInput || !searchResults) {
            console.warn("Search input or results container not found. Cannot apply filter.");
            return;
        }

        const filterText = searchInput.value.toLowerCase();
        const activeCategory = activeButton ? activeButton.getAttribute('data-filter') : 'all';

        categoryFilter.forEach(category => {
            const elements = searchResults.querySelectorAll('.' + category);
            elements.forEach(element => {
                const textMatch = element.textContent.toLowerCase().includes(filterText);
                const categoryMatch = (activeCategory === 'all' || activeCategory === category);

                if (textMatch && categoryMatch) {
                    element.classList.remove('hidden');
                } else {
                    element.classList.add('hidden');
                }
            });
        });
    }

});