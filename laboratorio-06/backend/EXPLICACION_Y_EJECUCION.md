# Laboratorio 6 - Probando el Backend (CC5003)

Este documento describe paso a paso cómo configurar y ejecutar tanto el servidor como la suite de pruebas automatizadas, seguido de una explicación detallada (por archivo y número de línea) de cada cambio realizado para resolver las preguntas **P1 a P6** del laboratorio.

---

## 1. Instrucciones de Ejecución del Sistema

### 1.1 Requisitos Previos
- **Node.js** (v18 o superior) y **npm**.
- **MongoDB** corriendo localmente en el puerto `27017`.
  - Si utilizas **Docker**, puedes levantar la instancia ejecutando:
    ```bash
    docker run -d -p 27017:27017 --name mongo-lab6 mongo:8
    ```
  - Si tienes **MongoDB Community** instalado localmente, asegúrate de que el servicio `mongod` esté activo en `mongodb://127.0.0.1:27017`.

### 1.2 Instalación de Dependencias
Abre una terminal en la carpeta `backend/` e instala los paquetes necesarios:
```bash
cd "Template Lab 6/backend"
npm install
```

### 1.3 Variables de Entorno (`.env`)
El proyecto incluye un archivo `.env` preconfigurado en `backend/.env` con los siguientes valores por defecto:
```env
PORT=3000
HOST=localhost
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DBNAME=lab6-dev
```

### 1.4 Ejecución de las Pruebas (Unitarias y de Integración)
Para correr toda la suite de pruebas (`P1` a `P6`) utilizando el test runner de Node (`node:test`), `tsx` y `supertest` sobre una base de datos aislada de pruebas (`lab6-test`):
```bash
npm test
```

### 1.5 Ejecución del Servidor en Modo Desarrollo o Producción
- **Modo desarrollo** (con `ts-node`):
  ```bash
  npm run dev
  ```
- **Modo producción** (compilando TypeScript a JavaScript en `out/`):
  ```bash
  npm run build
  npm start
  ```

---

## 2. Detalle del Código Implementado por Archivo y Línea

A continuación se detalla qué hace cada bloque de código agregado o modificado, indicando el archivo, las líneas exactas y cómo cumple con lo solicitado en cada pregunta del enunciado.

---

### Archivo 1: `backend/src/models/posts.ts`

1. **Líneas 6 a 7 (Configuración de conexión por defecto a MongoDB):**
   - **Qué se hizo:** Se agregaron valores por defecto (`"mongodb://127.0.0.1:27017"` y `"lab6-dev"`) a `process.env.MONGODB_URI` y `process.env.MONGODB_DBNAME`.
   - **Por qué:** Garantiza que al ejecutar `npm test` (que define `MONGODB_DBNAME=lab6-test`) Mongoose se conecte automáticamente al MongoDB local incluso si el usuario no ha definido un archivo `.env`.

2. **Líneas 27 a 47 (`// --- INICIO CAMBIO P1 ...` — Función `filterPostsByWord`):**
   - **Qué se hizo:** Se implementó y exportó la función `filterPostsByWord(posts: Post[], query: string): Post[]`.
     - En las **líneas 29-32**, se normaliza `query` con `.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "")` para limpiar signos de puntuación e ignorar mayúsculas/minúsculas.
     - En las **líneas 34-36**, se verifica si el arreglo `posts` está vacío o si `cleanQuery` es el string vacío `""`, retornando `[]` inmediatamente.
     - En las **líneas 38-45**, se filtra cada publicación transformando su `content` a minúsculas y dividiéndolo en palabras completas mediante la expresión regular Unicode `/[^\p{L}\p{N}]+/u` (que separa por espacios y cualquier signo de puntuación respetando tildes y eñes), verificando con `words.includes(cleanQuery)` la coincidencia exacta de palabra completa.
   - **Por qué cumple con P1:** Satisface el requerimiento 1 (devolver los posts que contengan `query`, ser *case-insensitive*, ignorar puntuación como en `"Es Bakemon, no Pokemon!"` y coincidir únicamente con palabras completas sin confundir `"sol"` con `"girasol"`) y el requerimiento 2 (retornar `[]` si `posts` es vacío, `query` es vacío o no hay coincidencias).

3. **Líneas 49 a 55 (`// --- INICIO CAMBIO P4 ...` — Validación de autores prohibidos):**
   - **Qué se hizo:** Se normalizó el arreglo `BANNED = ["huevito rey", "matías toro", "memes es mal ramo"]` completamente en minúsculas y en la función `isNotBanned(v: string)` se evalúa `!BANNED.includes(v.trim().toLowerCase())`.
   - **Por qué cumple con P4:** En el template original, el arreglo `BANNED` contenía letras mayúsculas (`"Huevito Rey"`, `"Matías Toro"`, `"Memes es mal ramo"`), pero se comparaba contra `v.toLowerCase()`, por lo que `BANNED.includes(...)` siempre daba `false` y nunca bloqueaba a los autores prohibidos. Con este cambio en las líneas 50-54, cualquier combinación de mayúsculas/minúsculas (como `"Huevito rey"` o `"HUEVITO REY"`) es rechazada con un `ValidationError` (código 400).

4. **Líneas 79 a 92 (`// --- INICIO CAMBIO P3 ...` — Transformación `toJSON`):**
   - **Qué se hizo:** Se configuró `postSchema.set("toJSON", ...)` en las líneas 80-89 **antes** de compilar el modelo con `mongoose.model<Post>("Post", postSchema)` en la línea 92, transformando `_id` en `id` (como string) y eliminando `_id` y `__v`.
   - **Por qué cumple con P3:** Cumple con el punto 1 de la P3, asegurando que todos los threads y comentarios serializados en las respuestas JSON expongan su identificador bajo la llave `id` y omitan `_id` y `__v`.

---

### Archivo 2: `backend/src/app.ts`

1. **Líneas 22 a 67 (Migración de endpoints existentes a `async/await`):**
   - **Qué se hizo:** Se actualizaron los controladores `GET /api/threads`, `GET /api/threads/:id` y `POST /api/threads` para utilizar funciones asíncronas (`async`) y `await` dentro de bloques `try / catch`.
   - **Por qué cumple con P2:** El enunciado en P2 especifica como requisito transversal que el código de esta pregunta y las siguientes debe escribirse usando funciones asíncronas y `await`.

2. **Líneas 69 a 102 (`// --- INICIO CAMBIO P5 ...` — Validaciones en `POST /api/threads/:id`):**
   - **Qué se hizo:**
     - En las **líneas 75-78**, antes de crear el comentario se consulta `await PostModel.findById(threadId)`. Si el documento no existe o si no es un thread raíz (`thread.thread !== null`), se responde inmediatamente con `404 Not Found` sin guardar nada en la base de datos.
     - En las **líneas 80-87**, si la petición incluye un `body.parent` no nulo, se busca dicho comentario padre con `await PostModel.findById(body.parent)` y se comprueba que exista y que su campo `thread` coincida con `threadId` (`parentPost.thread?.toString() !== threadId`). Si pertenece a otro thread o no existe, se responde con `400 Bad Request` sin guardar el comentario.
     - En las **líneas 89-97**, si ambas validaciones pasan, se instancia y guarda el nuevo comentario respondiendo con código `201`.
   - **Por qué cumple con P5:** Impide que queden comentarios colgando de threads inexistentes (devolviendo 404, P5.1), rechaza respuestas cuyo `parent` pertenezca a otro thread distinto (devolviendo 400, P5.2) y permite crear comentarios con un `parent` válido del mismo thread (devolviendo 201, P5.3).

3. **Líneas 104 a 125 (`// --- INICIO CAMBIO P6 ...` — Validaciones en `PUT /api/posts/:id`):**
   - **Qué se hizo:** En la llamada a `PostModel.findByIdAndUpdate(id, body, ...)` (líneas 110-114), se agregaron las opciones `{ new: true, runValidators: true, context: "query" }`.
   - **Por qué cumple con P6:** Por defecto, Mongoose no ejecuta los validadores del esquema en operaciones `findByIdAndUpdate`. Al activar `runValidators: true`, cualquier intento de actualizar un post con contenido vacío (`""`), contenido mayor a 300 caracteres o un autor prohibido lanza un `ValidationError` que es capturado por `errorHandler` devolviendo `400 Bad Request` y manteniendo intacto el documento en la base de datos (cumpliendo P6.1 a P6.5).

4. **Líneas 129 a 153 (`// --- INICIO CAMBIO P3 ...` — Middleware `unknownEndpoint` y orden de registro):**
   - **Qué se hizo:**
     - En las **líneas 130-134**, se definió y registró el middleware `unknownEndpoint`, que responde con estado `404` y el cuerpo JSON `{ error: "unknown endpoint" }`.
     - Se ubicó después de todas las rutas de la API y de `express.static("dist")`, pero justo antes de `errorHandler` (líneas 136-152). Además, se agregaron `return` explícitos en `errorHandler` (líneas 145 y 147) cuando se envía respuesta por `CastError` (400 por ID mal formado) o `ValidationError` (400 por fallo de validación).
   - **Por qué cumple con P3:** Cumple con los puntos 2, 3 y 4 de la P3: rutas inexistentes caen en `unknownEndpoint` devolviendo 404 con cuerpo JSON, y los errores de formato de ID (`CastError`) son atajados por `errorHandler` devolviendo 400 sin intentar reenviar cabeceras.

---

### Archivo 3: `backend/test/posts.test.ts`

1. **Líneas 10 a 101 (`// --- INICIO CAMBIO P1 ...` — Pruebas unitarias de `filterPostsByWord`):**
   - **Qué se hizo:** Se creó un bloque `describe` con 7 pruebas unitarias atómicas sobre un conjunto de posts en memoria (`samplePosts`):
     - **Líneas 55-59:** Verifica que retorna los posts que contienen `query`.
     - **Líneas 61-69:** Verifica que es *case-insensitive* (`"palabra"`, `"PALABRA"`, `"Palabra"`).
     - **Líneas 71-75:** Verifica que ignora signos de puntuación (`"bakemon"` coincide con `"Es Bakemon, no Pokemon!"`).
     - **Líneas 77-84:** Verifica que solo coincide con palabras completas (`"sol"` no coincide con `"girasol"`).
     - **Líneas 86-99:** Verifica los tres casos borde que deben retornar `[]` (`posts` vacío, `query` vacío `""` y `query` sin coincidencias).
   - **Por qué cumple con P1:** Cubre cada uno de los requerimientos funcionales solicitados en la Pregunta 1.

2. **Líneas 103 a 181 (`// --- INICIO CAMBIO P2 ...` — Sembrado con `beforeEach`, cierre con `after` y pruebas GET):**
   - **Qué se hizo:**
     - En las **líneas 111-155**, `beforeEach` limpia la colección (`PostModel.deleteMany({})`) y siembra 2 threads (`thread1` y `thread2`) junto con comentarios asociados (`2` comentarios en el primer thread y `1` comentario en el segundo), usando `async/await`.
     - En las **líneas 157-159**, `after` cierra la conexión de Mongoose (`await mongoose.connection.close()`) para que el proceso de Node termine limpiamente al finalizar los tests.
     - En las **líneas 161-180**, se prueban `GET /api/threads` (verificando que devuelva exactamente los 2 threads y no los comentarios) y `GET /api/threads/:id` (verificando que devuelva el thread junto con sus 2 comentarios).
   - **Por qué cumple con P2:** Cumple íntegramente con la limpieza, sembrado de al menos dos threads con comentarios, verificación de cantidades en ambos endpoints GET y cierre de conexión.

3. **Líneas 183 a 225 (`// --- INICIO CAMBIO P3 ...` — Pruebas de formato de respuesta y errores en GET):**
   - **Qué se hizo:**
     - **Líneas 185-205:** Comprueba que tanto en `GET /api/threads` como en `GET /api/threads/:id` cada objeto tenga definida la propiedad `id` y que `_id` y `__v` sean `undefined`.
     - **Líneas 207-210:** Genera un `ObjectId` válido pero no existente y verifica que `GET /api/threads/:id` responda `404`.
     - **Líneas 212-214:** Envía un ID mal formado (`"id-mal-formado-123"`) y verifica que `GET /api/threads/:id` responda `400`.
     - **Líneas 216-223:** Realiza una petición a `/api/ruta-que-no-existe` y verifica que responda `404` con `Content-Type: application/json` y una propiedad `error`.
   - **Por qué cumple con P3:** Verifica los 4 puntos solicitados en la Pregunta 3.

4. **Líneas 227 a 359 (`// --- INICIO CAMBIO P4 ...` — Pruebas de restricciones al crear threads y comentarios):**
   - **Qué se hizo:** En cada prueba se verifica tanto `POST /api/threads` como `POST /api/threads/:id`, consultando `await PostModel.countDocuments()` antes y después de cada petición:
     - **Líneas 229-247:** Contenido válido responde `201` y aumenta en `1` la cantidad de documentos en la colección.
     - **Líneas 249-260:** Petición sin `content` responde `400` y la cantidad de documentos no varía.
     - **Líneas 262-291:** Contenido de 301 caracteres responde `400` y no agrega nada; contenido de exactamente 300 caracteres responde `201` y se agrega a la base de datos.
     - **Líneas 293-307:** Contenido vacío `""` responde `400` y no agrega nada.
     - **Líneas 309-331:** Petición sin `author` responde `201`, incrementa el conteo en la base de datos y se verifica con `PostModel.findById` que el documento quedó guardado.
     - **Líneas 333-357:** Prueba los tres nombres prohibidos (`"Huevito rey"`, `"Matías Toro"`, `"Memes es mal ramo"`) y variantes de capitalización (`"HUEVITO REY"`, `"mAtÍaS tOrO"`), verificando que respondan `400` y que el conteo en la base de datos no cambie.
   - **Por qué cumple con P4:** Cubre las 6 restricciones exigidas tanto para threads como para comentarios comparando el estado de la base de datos antes y después.

5. **Líneas 361 a 409 (`// --- INICIO CAMBIO P5 ...` — Pruebas de comentarios huérfanos y `parent` inválido/válido):**
   - **Qué se hizo:**
     - **Líneas 363-374:** Envía `POST /api/threads/:id` a un `ObjectId` válido pero inexistente, verificando respuesta `404` y que no se cree el documento.
     - **Líneas 376-390:** Envía `POST /api/threads/:thread1Id` pasando como `parent` el ID de un comentario del segundo thread (`comment1Thread2Id`), verificando respuesta `400` y que no se cree el comentario.
     - **Líneas 392-407:** Envía `POST /api/threads/:thread1Id` pasando como `parent` un comentario del mismo thread (`comment1Thread1Id`), verificando respuesta `201` y que se agregue a la base de datos.
   - **Por qué cumple con P5:** Verifica los 3 casos de integridad referencial de comentarios pedidos en la Pregunta 5.

6. **Líneas 411 a 475 (`// --- INICIO CAMBIO P6 ...` — Pruebas de actualización en `PUT /api/posts/:id`):**
   - **Qué se hizo:**
     - **Líneas 413-425:** Actualiza los `likes` de un thread a `10`, verifica código `200` y consulta `PostModel.findById(thread1Id)` para confirmar que el cambio quedó persistido en MongoDB.
     - **Líneas 427-433:** Envía un `PUT` a un `ObjectId` válido pero inexistente y verifica que responda `404`.
     - **Líneas 435-447:** Envía un `PUT` con 301 caracteres, verifica código `400` y comprueba en la base de datos que `content` conserve su valor original.
     - **Líneas 449-460:** Envía un `PUT` con `content: ""`, verifica código `400` y comprueba en la base de datos que `content` no fue modificado.
     - **Líneas 462-473:** Envía un `PUT` con `author: "HUEVITO REY"`, verifica código `400` y comprueba en la base de datos que `author` conserve su valor original.
   - **Por qué cumple con P6:** Verifica los 5 escenarios de actualización y validación en `PUT /api/posts/:id`, comprobando siempre qué quedó guardado realmente en la base de datos.
