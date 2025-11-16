function SearchBar({ className, searchQuery, setSearchQuery, placeholder = "Buscar..." }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.value && e.target.value.trim()) {
            // Navigate to search page with the query
            const searchPagePath = '/Search';
            if (window.location.pathname !== searchPagePath) {
                sessionStorage.setItem('voiceSearchTerm', e.target.value.trim());
                window.location.href = searchPagePath;
            }
        }
    };


    return (
        <input
            type="text"
            className={className}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
        />
    );
}


export default SearchBar;


