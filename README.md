# El desafío del código

Minijuego de tres acertijos de cifrado en español. La tercera misión es un reto visual de cuatro dibujos y operaciones para descifrar el saludo «Feliz cumpleaños, Tobi». Está hecho con HTML, CSS y JavaScript sin herramientas de compilación, para que GitHub Pages pueda servirlo directamente.

## Probarlo en tu equipo

Abre `index.html` en un navegador. No se necesita instalar Python ni dependencias.

## Publicarlo en GitHub Pages

1. Crea un repositorio en GitHub y sube `index.html`, `style.css` y `game.js` a la rama principal.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama principal y la carpeta `/ (root)`, y guarda.
5. Abre la URL que aparece en esa página cuando termine la publicación.

GitHub Pages sirve archivos estáticos; no ejecuta un servidor Python. Si más adelante quieres escribir la lógica del juego en Python, puedes explorar PyScript, que ejecuta Python en el navegador, aunque añade tiempo de carga y una dependencia externa.

## Personalizar los acertijos

Edita la lista `riddles` al comienzo de `game.js`. Cada acertijo tiene un título, una explicación, el texto cifrado o dibujos, las respuestas y una pista. Las respuestas no distinguen mayúsculas, tildes ni espacios repetidos.
