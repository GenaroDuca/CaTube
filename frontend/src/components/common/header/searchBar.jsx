export function SearchBar({ searchQuery, setSearchQuery}) {
    return (
        <div>
            <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sr-header-input"
            />
        </div>
    );
}

export default SearchBar;