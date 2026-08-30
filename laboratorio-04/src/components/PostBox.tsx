// P1: componente que renderiza un thread o un comentario.
// Recibe el contenido y el autor. Si no hay autor, muestra "Anónimo". Si el
// comentario responde a otro, recibe su id y lo muestra; si no, no muestra nada.
// P4: si recibe `to`, el contenido es un link a la vista detallada del thread.
// P5: si recibe `onReply`, muestra un botón que despliega el formulario de respuesta.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PostForm from './PostForm'

interface PostBoxProps {
  content: string
  author: string | null
  parent?: number | null
  to?: string
  onReply?: (data: { content: string, author?: string }) => void
}

const PostBox = ({ content, author, parent, to, onReply }: PostBoxProps) => {
  const [replying, setReplying] = useState(false)

  return (
    <div className="post">
      {to ? <Link to={to}>{content}</Link> : <p>{content}</p>}
      <small>{author ?? 'Anónimo'}</small>
      {parent ? <small>{`Responde a #${parent}`}</small> : null}
      {onReply
        ? (
            <div>
              <button onClick={() => setReplying(!replying)}>Responder</button>
              {replying ? <PostForm onSubmit={onReply} /> : null}
            </div>
          )
        : null}
    </div>
  )
}

export default PostBox
