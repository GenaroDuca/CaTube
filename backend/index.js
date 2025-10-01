const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3306;

// Middlewares
app.use(cors());
app.use(express.json());

// **1. Sirve la aplicación de React**
// Esta línea es clave. Le dice a Express que sirva los archivos estáticos
// que se encuentran en la carpeta 'build' de tu frontend.
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// **2. Define tus rutas de API**
// Estas son las rutas que tu frontend de React consultará.
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Lionel Messi' },
    { id: 2, name: 'Enzo Fernández' },
    { id: 3, name: 'Julián Álvarez' },
  ];
  res.json(users);
});

// **3. Para cualquier otra ruta, sirve el index.html de React**
// Esto es esencial para el enrutamiento del lado del cliente (React Router).
// Si el usuario visita una ruta como /perfil, el servidor siempre le
// enviará el archivo 'index.html' de React, y React se encargará de
// mostrar el componente correcto.
// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
// });

// **4. Inicia el servidor**
app.listen(PORT, () => {
  console.log(`Servidor de backend escuchando en http://localhost:${PORT}`);
});
