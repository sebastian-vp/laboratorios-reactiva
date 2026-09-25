import {describe , it} from "node:test";
import assert from "node:assert/strict";

import type {Post} from "../../src/models/posts";
import filterPostsByWord from "../../src/utils/filterPostsByWord";
import { deepStrictEqual } from "node:assert";
import { fileURLToPath } from "node:url";

function createPost(content: string): Post {
    return {
        content, 
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        dislikes: 0,
    };
};

describe("filterPostsByWord", () => {
    it("debe devolver los posts que contienen quiery", () => {
        const posts = [
            createPost("Me gusta Pokemon"),
            createPost("Hoy fui a clases"),
            createPost("Pokemon es mi juego favorito"),
        ];

        const result = filterPostsByWord(posts, "Pokemon");

        assert.deepStrictEqual(result, [posts[0], posts[2]]);
    });

    it("Debe ignorar las mayúsculas y las minúsculas", () => {
        const posts = [
            createPost("Me gusta Pokemon"),
            createPost("pokemon es un juego"),
            createPost("POKEMON es divertido"),
            createPost("Otro juego"),
        ];

        const result = filterPostsByWord(posts, "pokemon");

        assert.deepStrictEqual(result, [posts[0], posts[1], posts[2]]);
    });

    it("debe ignorar la puntación", () => {
        const posts = [
            createPost("Es Bakemon, no Pokemon"),
            createPost("Es otro personaje"),
        ];

        const result = filterPostsByWord(posts, "bakemon")

        assert.deepStrictEqual(result, [posts[0]]);
    });

    it("Solo debe coincidir con palabras completas", () => {
        const posts = [
            createPost("Me gusta el girasol"),
            createPost("El sol es muy brillante"),
            createPost("Hoy salío el sol"),
        ];

        const result = filterPostsByWord(posts, "sol");

        assert.deepStrictEqual(result, [posts[1], posts[2]]);
    });

    it("Debe devolver un arreglo vació si posts está vacío", () => {
        const result = filterPostsByWord([], "pokdemon");

        assert.deepStrictEqual(result, []);
    });

    it("Deve devolver un arreglo vacío si query es un estring vacío", () => {
        const posts = [
            createPost("Me gusta pokemon"),
            createPost("Me gusta FF"),
        ];

        const result = filterPostsByWord(posts, "");

        assert.deepStrictEqual(result, []);
    });

    it("Deve devolver un arreglo vacío si ningún post contiene query", () => {
        const posts = [
            createPost("Me gusta pokemon"),
            createPost("Me gusta FF"),
        ];

        const result = filterPostsByWord(posts, "Bakemon");
        
        assert.deepStrictEqual(result, []);
    });
});