import logo from '../../../../public/catube_white.svg'
import { CatubeHeader } from './CatubeHeader.jsx'
import './CatubeHeader.css'

function Header( { searchQuery, setSearchQuery}) {
    return (
        <CatubeHeader
        logo={logo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        />
    )
}

export default Header