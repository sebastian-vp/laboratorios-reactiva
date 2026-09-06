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