// P1: componente que renderiza un thread o un comentario.
// Recibe el contenido y el autor. Si no hay autor, muestra "Anónimo". Si el
// comentario responde a otro, recibe su id y lo muestra; si no, no muestra nada.

interface PostBoxProps {
  content: string
  author: string | null
  parent?: number | null
}

const PostBox = ({ content, author, parent }: PostBoxProps) => {
  return (
    <div className="post">
      <p>{content}</p>
      <small>{author ?? 'Anónimo'}</small>
      {parent ? <small>{`Responde a #${parent}`}</small> : null}
    </div>
  )
}

export default PostBox
