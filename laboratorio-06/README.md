
# P1, preparativos y solución.

Antes de Ejecutar los test devemos crear la carpeta .env, en la cual debe presentar los siguientes comandos:

`````cmd

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DBNAME=lab6-test
PORT=3001

````

Posteriormente, se crea una carpeta ``utils`` dentro de ``src`` con la funcion filterPostsByWord, junto con la creación de la carpeta hermana de ``src`` llamada ``test``, en la cual, dentro de ella se encuentra la carpeta ``utils/filterPostsByWord.test.ts``, en donde se implementa lo pedido en la Pregunta 1.