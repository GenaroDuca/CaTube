import logo from '../../../../public/catube_white.svg'
import { CatubeHeader } from './CatubeHeader.jsx'
import './CatubeHeader.css'
import { useTheme } from '../../../hooks/useTheme'
import logoDark from '../../../../public/catube_dark.svg'

function Header({ searchQuery, setSearchQuery }) {
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