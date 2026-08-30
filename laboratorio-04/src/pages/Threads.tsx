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
        />
      ))}
    </div>
  )
}

export default Threads
