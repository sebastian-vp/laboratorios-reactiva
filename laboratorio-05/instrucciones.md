# Pregunta 1

- crear carpeta backend junta a la de frontend
- por terminal entrar a la carpeta backend y ejecutar `npm init -y`. 
- luego ejecutar `npm install --save-dev typescript @types/node`
- luego ejecutar `npx tsc --init`
- en el archvio package.json:
  * agregar (o cambiar a) `"type": "module"`
  * cambiar `main` de `index.js` a `index.ts`.
  * poner los siguientes scripts:
    ```json
    "scripts": {
      "build": "tsc",
      "start": "node out/index.js",
      "dev": "node --watch src/index.ts"
    }
    ```
- en el archivo tsconfig.josn (generado por npx tsc --init):
  * descomentar y setear rootDir y outDir con los siguiente valores:
    ```json
    "rootDir": "./src",
    "outDir": "./out",
    ```
  * agregar estas opciones
    ```json
    "allowImportingTsExtensions": true,
    "rewriteRelativeImportExtensions": true,
    ```
  * poner/cambiar 
    ```json
    "types": ["node"],
    ```

- instalar express con `npm install express`
- instalar los tipos de express con `npm install --save-dev @types/express`

- ejecutar comando docker para correr mongo sin instalar nada (aunque se debe tener docker): `docker run -d --name mongo-lab5 -p 27017:27017 mongo:7`
  * para apagarlo correr: `docker stop mongo-lab5`
  * para prenderlo correr: `docker start mongo-lab5`

- instalar mongoose (backend) con `npm install mongoose`

- crear archivo `src/models/post.ts`
- crear archivo `src/index.ts`

- ejecutar `npm run dev` y verificar que imprime "Server running on port 3001" y "Conectado a MongoDB"



# Pregunta 6

- ejecutar en carpeta backend `npm install dotenv`

- cambiar archivo index.ts
- cambiar package.json

- crear archivo .env con las variables de desarrollo

- correr desde el backend los siguientes comandos en orden
  ```
  npm run build:ui
  npm run build
  npm run start
  ```

  Luego abre http://localhost:3001/threads para comprobar que todo funciona

- entrar al servidor remoto, para ello escribir en la terminal: `ssh -p219 fullstack@fullstack.dcc.uchile.cl`
  * esto pedira la contraseña que se subio a u-cursos
  * nota: si sale algo de fingerprint poner yes, luego de eso pedira la contraseña
  
- una vez dentro poner `mkdir patos-reactivos`
  * nota: esta carpeta ya fue creada, asi que revisa que este o dale otro nombre (patos-reactivos-lab, por ejemplo)

- sale del servidor con `exit`

- correr comandos (desde el backend) `npm run build:ui` y `npm run build` para compilar el frontend y el backend respectivamente
  * nota: no es necesario hacerlo de nuevo si no has tocado de la útlima vez que lo hiciste

- borrar carpeta node_modules del backend para no subirla al servidor (se reinstalara alla)
- subir el backend con scp, para ello ejecutar desde la carpeta que contiene al backend y frontend: `scp -P219 -r backend fullstack@fullstack.dcc.uchile.cl:patos-reactivos/`
  * nota: debes poner la carpeta que creaste antes, si le cambiaste el nombre actualizalo en el comando anterior
  * nota: este comando pedira contraseña, volver a poner la misma de antes

- crear las variables de entorno en el servidor, para ello:
  * entrar con `ssh -p219 fullstack@fullstack.dcc.uchile.cl` y poner contraseña
  * entrar a la carpeta `patos-reactivos/backend` (recuerda que si es otra carpeta debes ingresar a ella)
  * ejecutar `vim .env`
  * pegar credenciales del servidor (ya habra un .env dentro, el que hiciste denante, debes reemplazar todo su contenido por el der servidor)
    - el puerto debe ser 70 + el numero que tienes en Integrantes de U-Cursos.

- instalar dependencias con `npm i`
- levantar con pm2: `pm2 start npm --name patos-reactivos-7069 -- run start`
  * el puerto debe ser 70 + el numero que tienes en Integrantes de U-Cursos.
- guardar los procesos: `pm2 save`

- ir a la ruta `https://fullstack.dcc.uchile.cl:7069/threads` en el navegador y comprobar que todo funciona
  * el puerto debe ser 70 + el numero que tienes en Integrantes de U-Cursos.

- si algo falla ejecutar `pm2 logs patos-reactivos-7069` para ver los logs. 
  * el puerto debe ser 70 + el numero que tienes en Integrantes de U-Cursos.