import logo from '../../../../public/catube_white.svg'
import { CatubeHeader } from './CatubeHeader.jsx'
import './CatubeHeader.css'

function SearchBar({ className, searchQuery, setSearchQuery }) {
    return (
        <input
            type="text"
            className={className}
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
    );
}

export default SearchBar;
