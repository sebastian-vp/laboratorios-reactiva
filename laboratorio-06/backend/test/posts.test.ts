process.env.MONGODB_DBNAME = "lab6-test";
import { describe, test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../src/app";
import PostModel, { Post, filterPostsByWord } from "../src/models/posts";

const api = supertest(app);

// --- INICIO CAMBIO P1: Pruebas unitarias para filterPostsByWord ---
describe("P1: Pruebas unitarias de filterPostsByWord", () => {
  const samplePosts: Post[] = [
    {
      content: "Hola mundo desde el foro de React",
      author: "Alice",
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      dislikes: 0,
    },
    {
      content: "PALABRA en mayúsculas, Palabra capitalizada y palabra normal",
      author: "Bob",
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 2,
      dislikes: 0,
    },
    {
      content: "Es Bakemon, no Pokemon!",
      author: "Charlie",
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 5,
      dislikes: 1,
    },
    {
      content: "El girasol mira hacia el horizonte, pero hoy hay mucho sol.",
      author: "Diana",
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 1,
      dislikes: 0,
    },
    {
      content: "Un jardín lleno de girasoles y un hermoso girasol",
      author: "Eve",
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      dislikes: 0,
    },
  ];

  test("1.1 Entrega todos los posts que contienen query en su contenido", () => {
    const result = filterPostsByWord(samplePosts, "foro");
    assert.equal(result.length, 1);
    assert.equal(result[0].content, "Hola mundo desde el foro de React");
  });

  test("1.2 La búsqueda es case insensitive (PALABRA, Palabra, palabra)", () => {
    const lower = filterPostsByWord(samplePosts, "palabra");
    const upper = filterPostsByWord(samplePosts, "PALABRA");
    const mixed = filterPostsByWord(samplePosts, "Palabra");

    assert.equal(lower.length, 1);
    assert.deepEqual(lower, upper);
    assert.deepEqual(lower, mixed);
  });

  test("1.3 Ignora la puntuación al buscar la palabra", () => {
    const result = filterPostsByWord(samplePosts, "bakemon");
    assert.equal(result.length, 1);
    assert.equal(result[0].content, "Es Bakemon, no Pokemon!");
  });

  test("1.4 Solo coincide con palabras completas ('sol' no coincide con 'girasol')", () => {
    const result = filterPostsByWord(samplePosts, "sol");
    assert.equal(result.length, 1);
    assert.equal(
      result[0].content,
      "El girasol mira hacia el horizonte, pero hoy hay mucho sol."
    );
  });

  test("2.1 Si posts está vacío, entrega un arreglo vacío", () => {
    const result = filterPostsByWord([], "palabra");
    assert.deepEqual(result, []);
  });

  test("2.2 Si query es el string vacío, entrega un arreglo vacío", () => {
    const result = filterPostsByWord(samplePosts, "");
    assert.deepEqual(result, []);
  });

  test("2.3 Si ningún elemento contiene a query, entrega un arreglo vacío", () => {
    const result = filterPostsByWord(samplePosts, "inexistente");
    assert.deepEqual(result, []);
  });
});
// --- FIN CAMBIO P1 ---

// --- INICIO CAMBIO P2: Pruebas de integración con beforeEach, after y consultas GET ---
describe("P2 - P6: Pruebas de integración del backend", () => {
  let thread1Id: string;
  let thread2Id: string;
  let comment1Thread1Id: string;
  let comment2Thread1Id: string;
  let comment1Thread2Id: string;

  beforeEach(async () => {
    await PostModel.deleteMany({});

    const thread1 = await new PostModel({
      content: "Primer thread de prueba",
      author: "Usuario1",
      thread: null,
      likes: 0,
      dislikes: 0,
    }).save();
    thread1Id = thread1._id.toString();

    const thread2 = await new PostModel({
      content: "Segundo thread de prueba",
      author: "Usuario2",
      thread: null,
      likes: 0,
      dislikes: 0,
    }).save();
    thread2Id = thread2._id.toString();

    const comment1T1 = await new PostModel({
      content: "Primer comentario del thread 1",
      author: "Comentarista1",
      thread: thread1._id,
      parent: null,
    }).save();
    comment1Thread1Id = comment1T1._id.toString();

    const comment2T1 = await new PostModel({
      content: "Segundo comentario del thread 1",
      author: "Comentarista2",
      thread: thread1._id,
      parent: comment1T1._id,
    }).save();
    comment2Thread1Id = comment2T1._id.toString();

    const comment1T2 = await new PostModel({
      content: "Primer comentario del thread 2",
      author: "Comentarista3",
      thread: thread2._id,
      parent: null,
    }).save();
    comment1Thread2Id = comment1T2._id.toString();
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe("P2: Cantidad correcta de publicaciones en GET", () => {
    test("GET /api/threads devuelve solo los threads (2 threads)", async () => {
      const response = await api
        .get("/api/threads")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.equal(response.body.length, 2);
    });

    test("GET /api/threads/:id devuelve el thread con todos sus comentarios (2 comentarios)", async () => {
      const response = await api
        .get(`/api/threads/${thread1Id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.equal(response.body.thread.content, "Primer thread de prueba");
      assert.equal(response.body.comments.length, 2);
    });
  });
  // --- FIN CAMBIO P2 ---

  // --- INICIO CAMBIO P3: Forma de las respuestas y manejo de casos inválidos ---
  describe("P3: Forma de las respuestas y manejo de casos inválidos", () => {
    test("3.1 Cada thread y comentario devuelto tiene propiedad 'id' y no tiene '_id' ni '__v'", async () => {
      const threadsResponse = await api.get("/api/threads").expect(200);
      for (const thread of threadsResponse.body) {
        assert.ok(thread.id);
        assert.equal(thread._id, undefined);
        assert.equal(thread.__v, undefined);
      }

      const detailResponse = await api
        .get(`/api/threads/${thread1Id}`)
        .expect(200);
      assert.ok(detailResponse.body.thread.id);
      assert.equal(detailResponse.body.thread._id, undefined);
      assert.equal(detailResponse.body.thread.__v, undefined);

      for (const comment of detailResponse.body.comments) {
        assert.ok(comment.id);
        assert.equal(comment._id, undefined);
        assert.equal(comment.__v, undefined);
      }
    });

    test("3.2 GET /api/threads/:id con un id válido que no existe responde 404", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await api.get(`/api/threads/${nonExistentId}`).expect(404);
    });

    test("3.3 GET /api/threads/:id con un id mal formado responde 400", async () => {
      await api.get("/api/threads/id-mal-formado-123").expect(400);
    });

    test("3.4 Una petición a una ruta que no existe responde 404 y un cuerpo JSON con el error", async () => {
      const response = await api
        .get("/api/ruta-que-no-existe")
        .expect(404)
        .expect("Content-Type", /application\/json/);

      assert.ok(response.body.error);
    });
  });
  // --- FIN CAMBIO P3 ---

  // --- INICIO CAMBIO P4: Pruebas de restricciones del esquema al crear threads y comentarios ---
  describe("P4: Restricciones al crear un thread (POST /api/threads) y un comentario (POST /api/threads/:id)", () => {
    test("4.1 Con contenido válido, responde 201 y se agrega exactamente una publicación (thread y comentario)", async () => {
      const beforeThreadCount = await PostModel.countDocuments();
      await api
        .post("/api/threads")
        .send({ content: "Nuevo thread válido", author: "AutorValido" })
        .expect(201)
        .expect("Content-Type", /application\/json/);
      const afterThreadCount = await PostModel.countDocuments();
      assert.equal(afterThreadCount, beforeThreadCount + 1);

      const beforeCommentCount = await PostModel.countDocuments();
      await api
        .post(`/api/threads/${thread1Id}`)
        .send({ content: "Nuevo comentario válido", author: "AutorValido" })
        .expect(201)
        .expect("Content-Type", /application\/json/);
      const afterCommentCount = await PostModel.countDocuments();
      assert.equal(afterCommentCount, beforeCommentCount + 1);
    });

    test("4.2 Si el contenido no viene en la petición, responde 400 y no se agrega nada", async () => {
      const beforeCount = await PostModel.countDocuments();

      await api.post("/api/threads").send({ author: "AutorValido" }).expect(400);
      assert.equal(await PostModel.countDocuments(), beforeCount);

      await api
        .post(`/api/threads/${thread1Id}`)
        .send({ author: "AutorValido" })
        .expect(400);
      assert.equal(await PostModel.countDocuments(), beforeCount);
    });

    test("4.3 Si el contenido excede 300 caracteres responde 400 y no agrega nada; con exactamente 300 se acepta", async () => {
      const content301 = "a".repeat(301);
      const content300 = "a".repeat(300);

      const beforeCount = await PostModel.countDocuments();

      await api
        .post("/api/threads")
        .send({ content: content301, author: "Autor" })
        .expect(400);
      assert.equal(await PostModel.countDocuments(), beforeCount);

      await api
        .post(`/api/threads/${thread1Id}`)
        .send({ content: content301, author: "Autor" })
        .expect(400);
      assert.equal(await PostModel.countDocuments(), beforeCount);

      await api
        .post("/api/threads")
        .send({ content: content300, author: "Autor" })
        .expect(201);
      assert.equal(await PostModel.countDocuments(), beforeCount + 1);

      await api
        .post(`/api/threads/${thread1Id}`)
        .send({ content: content300, author: "Autor" })
        .expect(201);
      assert.equal(await PostModel.countDocuments(), beforeCount + 2);
    });

    test("4.4 Si el contenido es el string vacío, responde 400 y no se agrega nada", async () => {
      const beforeCount = await PostModel.countDocuments();

      await api
        .post("/api/threads")
        .send({ content: "", author: "Autor" })
        .expect(400);
      assert.equal(await PostModel.countDocuments(), beforeCount);

      await api
        .post(`/api/threads/${thread1Id}`)
        .send({ content: "", author: "Autor" })
        .expect(400);
      assert.equal(await PostModel.countDocuments(), beforeCount);
    });

    test("4.5 Si author no viene, la publicación se guarda con éxito en la base de datos", async () => {
      const beforeThreadCount = await PostModel.countDocuments();
      const threadRes = await api
        .post("/api/threads")
        .send({ content: "Thread sin autor" })
        .expect(201);
      const afterThreadCount = await PostModel.countDocuments();
      assert.equal(afterThreadCount, beforeThreadCount + 1);
      const savedThread = await PostModel.findById(threadRes.body.id);
      assert.ok(savedThread);
      assert.equal(savedThread.content, "Thread sin autor");

      const beforeCommentCount = await PostModel.countDocuments();
      const commentRes = await api
        .post(`/api/threads/${thread1Id}`)
        .send({ content: "Comentario sin autor" })
        .expect(201);
      const afterCommentCount = await PostModel.countDocuments();
      assert.equal(afterCommentCount, beforeCommentCount + 1);
      const savedComment = await PostModel.findById(commentRes.body.id);
      assert.ok(savedComment);
      assert.equal(savedComment.content, "Comentario sin autor");
    });

    test("4.6 Si author es uno de los nombres prohibidos (incluyendo otra capitalización), responde 400 y no agrega nada", async () => {
      const bannedAuthors = [
        "Huevito rey",
        "Matías Toro",
        "Memes es mal ramo",
        "HUEVITO REY",
        "mAtÍaS tOrO",
      ];

      const beforeCount = await PostModel.countDocuments();

      for (const banned of bannedAuthors) {
        await api
          .post("/api/threads")
          .send({ content: "Contenido válido", author: banned })
          .expect(400);
        assert.equal(await PostModel.countDocuments(), beforeCount);

        await api
          .post(`/api/threads/${thread1Id}`)
          .send({ content: "Contenido válido", author: banned })
          .expect(400);
        assert.equal(await PostModel.countDocuments(), beforeCount);
      }
    });
  });
  // --- FIN CAMBIO P4 ---

  // --- INICIO CAMBIO P5: Pruebas de integridad de thread y parent al crear comentarios ---
  describe("P5: Integridad de thread y parent en POST /api/threads/:id", () => {
    test("5.1 POST /api/threads/:id con un id de thread válido pero inexistente responde 404 y no crea el comentario", async () => {
      const nonExistentThreadId = new mongoose.Types.ObjectId().toString();
      const beforeCount = await PostModel.countDocuments();

      await api
        .post(`/api/threads/${nonExistentThreadId}`)
        .send({ content: "Comentario huérfano", author: "Usuario" })
        .expect(404);

      const afterCount = await PostModel.countDocuments();
      assert.equal(afterCount, beforeCount);
    });

    test("5.2 POST /api/threads/:id con un parent que no pertenece a ese thread responde 400 y no crea el comentario", async () => {
      const beforeCount = await PostModel.countDocuments();

      await api
        .post(`/api/threads/${thread1Id}`)
        .send({
          content: "Respuesta con parent de otro thread",
          author: "Usuario",
          parent: comment1Thread2Id,
        })
        .expect(400);

      const afterCount = await PostModel.countDocuments();
      assert.equal(afterCount, beforeCount);
    });

    test("5.3 POST /api/threads/:id con un parent que sí es un comentario de ese thread responde 201 y lo guarda", async () => {
      const beforeCount = await PostModel.countDocuments();

      const response = await api
        .post(`/api/threads/${thread1Id}`)
        .send({
          content: "Respuesta válida a un comentario del mismo thread",
          author: "Usuario",
          parent: comment1Thread1Id,
        })
        .expect(201);

      const afterCount = await PostModel.countDocuments();
      assert.equal(afterCount, beforeCount + 1);
      assert.equal(response.body.parent, comment1Thread1Id);
    });
  });
  // --- FIN CAMBIO P5 ---

  // --- INICIO CAMBIO P6: Pruebas para el endpoint PUT /api/posts/:id ---
  describe("P6: Actualización de publicaciones con PUT /api/posts/:id", () => {
    test("6.1 Un PUT con cuerpo válido responde 200 y el cambio queda guardado en la base de datos", async () => {
      const response = await api
        .put(`/api/posts/${thread1Id}`)
        .send({ likes: 10 })
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.equal(response.body.likes, 10);

      const updatedInDb = await PostModel.findById(thread1Id);
      assert.ok(updatedInDb);
      assert.equal(updatedInDb.likes, 10);
    });

    test("6.2 Un PUT con un id válido pero que no existe responde 404", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await api
        .put(`/api/posts/${nonExistentId}`)
        .send({ likes: 5 })
        .expect(404);
    });

    test("6.3 Un PUT que deja el contenido por sobre los 300 caracteres responde 400 y no modifica la publicación", async () => {
      const beforePost = await PostModel.findById(thread1Id);
      const longContent = "x".repeat(301);

      await api
        .put(`/api/posts/${thread1Id}`)
        .send({ content: longContent })
        .expect(400);

      const afterPost = await PostModel.findById(thread1Id);
      assert.ok(afterPost);
      assert.equal(afterPost.content, beforePost?.content);
    });

    test("6.4 Un PUT que deja el contenido vacío responde 400 y no modifica la publicación", async () => {
      const beforePost = await PostModel.findById(thread1Id);

      await api
        .put(`/api/posts/${thread1Id}`)
        .send({ content: "" })
        .expect(400);

      const afterPost = await PostModel.findById(thread1Id);
      assert.ok(afterPost);
      assert.equal(afterPost.content, beforePost?.content);
    });

    test("6.5 Un PUT que pone un autor prohibido responde 400 y no modifica la publicación", async () => {
      const beforePost = await PostModel.findById(thread1Id);

      await api
        .put(`/api/posts/${thread1Id}`)
        .send({ author: "HUEVITO REY" })
        .expect(400);

      const afterPost = await PostModel.findById(thread1Id);
      assert.ok(afterPost);
      assert.equal(afterPost.author, beforePost?.author);
    });
  });
  // --- FIN CAMBIO P6 ---
});
