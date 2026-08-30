// P1: componente que renderiza un thread o un comentario.
// Recibe el contenido y el autor. Si no hay autor, muestra "Anónimo". Si el
// comentario responde a otro, recibe su id y lo muestra; si no, no muestra nada.
// P4: si recibe `to`, el contenido es un link a la vista detallada del thread.
import { Link } from 'react-router-dom'

interface PostBoxProps {
  content: string
  author: string | null
  parent?: number | null
  to?: string
}

const PostBox = ({ content, author, parent, to }: PostBoxProps) => {
  return (
    <div className="post">
      {to ? <Link to={to}>{content}</Link> : <p>{content}</p>}
      <small>{author ?? 'Anónimo'}</small>
      {parent ? <small>{`Responde a #${parent}`}</small> : null}
    </div>
  )
}

export default PostBox
