// P2: página principal, con el listado de threads.
// P5: formulario al principio que crea un thread.
import { useEffect, useState } from 'react'
import type { Post } from '../types/posts'
import threadsService from '../services/threads'
import PostBox from '../components/PostBox'
import PostForm from '../components/PostForm'

const Threads = () => {
  const [threads, setThreads] = useState<Post[]>([])

  useEffect(() => {
    threadsService.getAll().then(setThreads)
  }, [])

  const addThread = (data: { content: string, author?: string }) => {
    threadsService.create(data).then(created =>
      setThreads(prev => prev.concat(created)))
  }

  // P6: guarda el thread ya modificado y reemplaza su copia en el estado.
  const save = (updated: Post) => {
    threadsService.update(updated.id, updated).then(saved =>
      setThreads(prev => prev.map(t => (t.id === saved.id ? saved : t))))
  }

  return (
    <div>
      <h1>Pila Completa</h1>
      <PostForm onSubmit={addThread} />
      {threads.map(thread => (
        <PostBox
          key={thread.id}
          content={thread.content}
          author={thread.author}
          to={`/${thread.id}`}
          likes={thread.likes}
          dislikes={thread.dislikes}
          onLike={() => save({ ...thread, likes: thread.likes + 1 })}
          onDislike={() => save({ ...thread, dislikes: thread.dislikes + 1 })}
        />
      ))}
    </div>
  )
}

export default Threads
