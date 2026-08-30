// P2: página principal, con el listado de threads.
import { useEffect, useState } from 'react'
import type { Post } from '../types/posts'
import threadsService from '../services/threads'
import PostBox from '../components/PostBox'

const Threads = () => {
  const [threads, setThreads] = useState<Post[]>([])

  useEffect(() => {
    threadsService.getAll().then(setThreads)
  }, [])

  return (
    <div>
      <h1>Pila Completa</h1>
      {threads.map(thread => (
        <PostBox
          key={thread.id}
          content={thread.content}
          author={thread.author}
        />
      ))}
    </div>
  )
}

export default Threads
