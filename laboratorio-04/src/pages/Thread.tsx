// P4: vista detallada de un thread, con el thread y su listado de comentarios.
// P5: formulario al principio que crea un comentario, y un formulario de
// respuesta desplegable debajo de cada comentario.
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Post } from '../types/posts'
import threadsService from '../services/threads'
import PostBox from '../components/PostBox'
import PostForm from '../components/PostForm'

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

  const addComment = (data: { content: string, author?: string, parent?: number }) => {
    threadsService.createComment(data, thread.id).then(created =>
      setComments(prev => prev.concat(created)))
  }

  // P6: guarda el thread ya modificado (los likes del thread de la vista).
  const saveThread = (updated: Post) => {
    threadsService.update(updated.id, updated).then(setThread)
  }

  // P6: guarda un comentario ya modificado y reemplaza su copia en el estado.
  const saveComment = (updated: Post) => {
    threadsService.update(updated.id, updated).then(saved =>
      setComments(prev => prev.map(c => (c.id === saved.id ? saved : c))))
  }

  return (
    <div>
      <h1>Pila Completa</h1>
      <PostBox
        content={thread.content}
        author={thread.author}
        likes={thread.likes}
        dislikes={thread.dislikes}
        onLike={() => saveThread({ ...thread, likes: thread.likes + 1 })}
        onDislike={() => saveThread({ ...thread, dislikes: thread.dislikes + 1 })}
      />
      <h2>Comentarios</h2>
      <PostForm onSubmit={addComment} />
      {comments.map(comment => (
        <PostBox
          key={comment.id}
          content={comment.content}
          author={comment.author}
          parent={comment.parent}
          onReply={data => addComment({ ...data, parent: comment.id })}
          likes={comment.likes}
          dislikes={comment.dislikes}
          onLike={() => saveComment({ ...comment, likes: comment.likes + 1 })}
          onDislike={() => saveComment({ ...comment, dislikes: comment.dislikes + 1 })}
        />
      ))}
    </div>
  )
}

export default Thread
