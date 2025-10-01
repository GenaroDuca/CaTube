export function SearchBar({ searchQuery, setSearchQuery, className}) {
    return (
        <div>
            <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={className}
            />
        </div>
    );
}

export default SearchBar;