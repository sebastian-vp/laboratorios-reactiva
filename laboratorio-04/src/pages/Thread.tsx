// P4: vista detallada de un thread, con el thread y su listado de comentarios.
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Post } from '../types/posts'
import threadsService from '../services/threads'
import PostBox from '../components/PostBox'

const Thread = () => {
  const { id } = useParams()
  const [thread, setThread] = useState<Post | null>(null)
  const [comments, setComments] = useState<Post[]>([])

  useEffect(() => {
    threadsService.getThread(id!).then((answer) => {
      setThread(answer.thread)
      setComments(answer.comments)
    })
  }, [id])

  if (!thread) return null

  return (
    <div>
      <h1>Pila Completa</h1>
      <PostBox content={thread.content} author={thread.author} />
      <h2>Comentarios</h2>
      {comments.map(comment => (
        <PostBox
          key={comment.id}
          content={comment.content}
          author={comment.author}
          parent={comment.parent}
        />
      ))}
    </div>
  )
}

export default Thread
