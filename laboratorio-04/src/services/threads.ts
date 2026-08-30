// P2: módulo para comunicarse con el servidor (corre en localhost:3001).
import axios from 'axios'
import type { Post } from '../types/posts'

const baseUrl = 'http://localhost:3001'

interface ThreadData {
  content: string
  author?: string
}

// Lista todos los threads.
const getAll = (): Promise<Post[]> =>
  axios.get<Post[]>(`${baseUrl}/threads`).then(response => response.data)

// Crea un thread. El servidor solo necesita contenido y, si lo hay, autor.
const create = (data: ThreadData): Promise<Post> =>
  axios.post<Post>(`${baseUrl}/threads`, data).then(response => response.data)

export default { getAll, create }
