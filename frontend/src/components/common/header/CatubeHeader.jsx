//Components
import SearchBar from "./searchBar.jsx"
import { NotificationMenu } from "../modal/headerModalsComponents/notificationsMenu/NotificationMenu.jsx";
import { UserMenu } from "../../user/UserMenu.jsx";
import { useModal } from '../../common/modal/ModalContext';

//Icons
import { FaCirclePlus, FaMicrophone } from "react-icons/fa6";
import { ImSearch } from "react-icons/im";
//Router
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
//Hooks
import { useState } from 'react';

export function CatubeHeader({ logo, searchQuery, setSearchQuery }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isRegisterPage = pathname.includes('/register');

    // Local state for search query if not provided
    const [localSearchQuery, setLocalSearchQuery] = useState('');

    // Use provided or local
    const currentSearchQuery = searchQuery !== undefined ? searchQuery : localSearchQuery;
    const currentSetSearchQuery = setSearchQuery || setLocalSearchQuery;

    // Voice search states
    const [isListening, setIsListening] = useState(false);
    const [placeholder, setPlaceholder] = useState("Buscar...");

    //Conditional classes and visibility
    const cardClassName = isRegisterPage
        ? 'sr-header-right register'
        : 'sr-header-right';

    const showSearchBar = !isRegisterPage;

    const { openModal } = useModal();

    const handleVoiceSearch = () => {
        // console.log('Voice search started');
        let finalSearchTranscript = '';
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('SpeechRecognition not supported');
            return;
        }
        if (!currentSetSearchQuery) {
            console.error('setSearchQuery not available');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onstart = () => {
            setIsListening(true);
            setPlaceholder("Escuchando...");
        };

        recognition.onresult = (e) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = 0; i < e.results.length; i++) {
                const transcript = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            currentSetSearchQuery(finalTranscript + interimTranscript);
            finalSearchTranscript = finalTranscript;
        };

        recognition.onend = () => {
            setIsListening(false);
            setPlaceholder("Buscar...");
            let cleanedTranscript = finalSearchTranscript.trim();
            cleanedTranscript = cleanedTranscript.replace(/\.$/, '');
            if (cleanedTranscript) {
                const searchPagePath = '/Search';
                if (pathname.includes(searchPagePath)) {
                    currentSetSearchQuery(cleanedTranscript);
                } else {
                    sessionStorage.setItem('voiceSearchTerm', cleanedTranscript);
                    navigate(searchPagePath);
                }
            }
        };

        recognition.onerror = (e) => {
            setIsListening(false);
            setPlaceholder("Error, intenta de nuevo");
            console.error("Error en Speech Recognition: ", e.error);
        };

        recognition.start();
    };

    return (
        <header className="sr-header">
            <Link to={`/`}>
                <div className="sr-header-logo">
                    <img className="sr-header-symbol" src={logo} alt={`Logo de Catube`} />
                    <span className="sr-header-title">CaTube</span>
                </div>
            </Link>

            {showSearchBar && (
                <div className="sr-header-searchBar">
                    <button
                        className={`sr-header-micButton ${isListening ? 'listening' : ''}`}
                        onClick={handleVoiceSearch}
                    >
                        <FaMicrophone size={20} />
                    </button>
                    <div className="sr-header-searchBarSection">
                        <SearchBar
                            className="sr-header-input"
                            searchQuery={currentSearchQuery}
                            setSearchQuery={currentSetSearchQuery}
                            placeholder={placeholder}
                        />
                        <Link to={`/Search`}>
                            <button className="sr-header-searchButton"><ImSearch size={20} /></button>
                        </Link>
                    </div>
                </div>
            )}

            <div className={cardClassName}>
                <button className="sr-header-createButton" onClick={() => openModal('createvideo')}>
                    <span className="sr-header-createLabel">Create</span>
                    <FaCirclePlus color={"#90B484"} size={28} />
                </button>
                <div className="sr-header-userActions">
                    <NotificationMenu />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
