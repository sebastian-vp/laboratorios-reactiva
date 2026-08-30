// P2 y P3: módulo para comunicarse con el servidor (corre en localhost:3001).
import axios from 'axios'
import type { Post } from '../types/posts'

const baseUrl = 'http://localhost:3001'

interface ThreadData {
  content: string
  author?: string
}

interface CommentData {
  content: string
  author?: string
  parent?: number
}

interface ThreadAnswer {
  thread: Post
  comments: Post[]
}

// Lista todos los threads.
const getAll = (): Promise<Post[]> =>
  axios.get<Post[]>(`${baseUrl}/threads`).then(response => response.data)

// Crea un thread. El servidor solo necesita contenido y, si lo hay, autor.
const create = (data: ThreadData): Promise<Post> =>
  axios.post<Post>(`${baseUrl}/threads`, data).then(response => response.data)

// Obtiene un thread junto a su listado de comentarios.
const getThread = (id: string): Promise<ThreadAnswer> =>
  axios.get<ThreadAnswer>(`${baseUrl}/threads/${id}`).then(response => response.data)

// Crea un comentario dentro de un thread. parent es el id del comentario al que
// responde, y debe pertenecer al mismo thread.
const createComment = (data: CommentData, threadId: number): Promise<Post> =>
  axios.post<Post>(`${baseUrl}/threads/${threadId}`, data).then(response => response.data)

export default { getAll, create, getThread, createComment }
