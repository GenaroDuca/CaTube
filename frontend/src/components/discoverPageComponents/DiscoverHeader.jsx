import React from 'react';

function DiscoverHeader() {
  const handleSubmit = (e) => {
    e.preventDefault();

    alert('Buscando con CaTube AI (funcionalidad SOON)...');
  };

  return (
    <div className="first-discover-container">
      <div>
        <h1>Discover</h1>
        <p>Powered by CaTube AI</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className="soon"
          type="text"
          placeholder="Chat with CaTube AI, tell me what do you want to watch"
          required
        />
        {/* Podrías añadir un botón de submit si lo deseas */}
      </form>
    </div>
  );
}

export default DiscoverHeader;