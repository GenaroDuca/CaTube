import { useTheme } from '../../context/themeContext.jsx'
import logo from '../../../../public/catube_white.svg'
import logoDark from '../../../../public/catube_dark.svg'
import { CatubeHeader } from './CatubeHeader.jsx'
import './CatubeHeader.css'

function Header( { searchQuery, setSearchQuery}) {
    const { isDarkMode } = useTheme();
    return (
        <CatubeHeader
        logo={isDarkMode ? logo : logoDark}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        />
    )
}

export default Header