import { defaultMaxListeners } from "events";
import type {Post} from "../models/posts";

function filterPostsByWord(posts: Post[], query: string): Post[] {
    
    if (posts.length === 0 || query.trim() === "") {
        return [];
    };

    const normQuery = query.trim().toLocaleLowerCase();

    return posts.filter((post) => {
        const word = post.content.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/);

        return word.includes(normQuery);
    })
};

export default filterPostsByWord;