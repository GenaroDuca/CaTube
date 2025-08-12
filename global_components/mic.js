document.addEventListener('DOMContentLoaded', () => {

    let finalSearchTranscript = '';

    document.addEventListener('click', (event) => {

        if (event.target.closest('#mic-btn')) {

            const micBtn = document.getElementById('mic-btn');
            const searchInput = document.getElementById('searchInput');
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition && searchInput && micBtn) {
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

                    finalSearchTranscript = finalTranscript;
                    searchInput.value = finalTranscript + interimTranscript;
                };
                
                recognition.onend = () => {
                    micBtn.classList.remove('listening');
                    searchInput.placeholder = "Search";

                    if (finalSearchTranscript) {
                        const searchURL = `/search/search.html?q=${encodeURIComponent(finalSearchTranscript)}`;
                        window.location.href = searchURL;
                    }   
                };

                recognition.onerror = (e) => {
                    micBtn.classList.remove('listening');
                    searchInput.placeholder = "Error, intenta de nuevo";
                    console.error("Error en Speech Recognition: ", e.error);
                };

                recognition.start();

            } else {
                console.error("API de Voz no compatible o falta el input de búsqueda.");
            }
        }
    });
});