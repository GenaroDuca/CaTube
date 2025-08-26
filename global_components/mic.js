document.addEventListener('click', (event) => {
    if (event.target.closest('#mic-btn')) {
        handleVoiceSearch();
    }
});

function handleVoiceSearch() {
    let finalSearchTranscript = '';
    const micBtn = document.getElementById('mic-btn');
    const searchInput = document.getElementById('searchInput');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || !searchInput || !micBtn) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
        finalSearchTranscript = '';
        searchInput.value = '';
        micBtn.classList.add('listening');
        searchInput.placeholder = "Escuchando...";
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
        searchInput.value = finalTranscript + interimTranscript;
        finalSearchTranscript = finalTranscript;
    };

    recognition.onend = () => {
        micBtn.classList.remove('listening');
        searchInput.placeholder = "Search";
        let cleanedTranscript = finalSearchTranscript.trim();
        cleanedTranscript = cleanedTranscript.replace(/\.$/, '');
        if (cleanedTranscript) {
        const searchPagePath = '/search/search.html';
        if (window.location.pathname.includes(searchPagePath)) {
            searchInput.value = cleanedTranscript; 
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            sessionStorage.setItem('voiceSearchTerm', cleanedTranscript);
            window.location.href = searchPagePath;
        }
    }
    };
    
    recognition.onerror = (e) => {
        micBtn.classList.remove('listening');
        searchInput.placeholder = "Error, intenta de nuevo";
        console.error("Error en Speech Recognition: ", e.error);
    };

    recognition.start();
}

function checkForVoiceSearch() {
    const searchTerm = sessionStorage.getItem('voiceSearchTerm');
    if (searchTerm) {
        sessionStorage.removeItem('voiceSearchTerm');
        console.log(`Recado encontrado: "${searchTerm}". Esperando al input de búsqueda...`);
        waitForInputAndFilter(searchTerm);
    }
}

function waitForInputAndFilter(searchTerm) {
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        console.log("¡Input de búsqueda encontrado! Aplicando filtro ahora.");
        searchInput.value = searchTerm;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.log("Input de búsqueda aún no está listo, reintentando en 100ms...");
        setTimeout(() => waitForInputAndFilter(searchTerm), 100);
    }
}

checkForVoiceSearch();