'use strict';

addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#searchInput');
    const searchBtnFilter = document.querySelectorAll('.filter-search-btn');
    const searchResults = document.querySelector('.search-results');
    const categoryFilter = ['recommendations', 'channel-results', 'short-results', 'playlist-results'];

    // button click event to filter search results
    searchBtnFilter.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove 'active' class from all buttons and add to the clicked button
            searchBtnFilter.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Filter search results based on the clicked button's data-filter attribute
            const filter = btn.getAttribute('data-filter');
            applyFilter();
        });
    });

    // search input event to filter search results
    searchInput.addEventListener('input', () => {
        applyFilter();
    });

    // Function to apply the filter based on the search input and active button
    function applyFilter() {
        const activeButton = document.querySelector('.filter-search-btn.active');
        const filter = activeButton ? activeButton.getAttribute('data-filter') : 'all';

        categoryFilter.forEach(category => {
            const elements = searchResults.querySelectorAll('.' + category);
            elements.forEach(element => {
                const textFilter = element.textContent.toLowerCase().includes(searchInput.value.toLowerCase());
                const categoryMatch = (filter === 'all' || filter === category);
                if (textFilter && categoryMatch) {
                    element.classList.remove('hidden');
                } else {
                    element.classList.add('hidden');
                }
            });
        });
    }
});