// P5: formulario para publicar. Pide contenido y, opcional, autor. Quien lo usa
// decide qué hacer al enviarlo (crear un thread, un comentario o una respuesta).
import { useState, type FormEvent } from 'react'

interface PostFormProps {
  onSubmit: (data: { content: string, author?: string }) => void
}

const PostForm = ({ onSubmit }: PostFormProps) => {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ content, author: author || undefined })
    setContent('')
    setAuthor('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={content}
        onChange={event => setContent(event.target.value)}
        placeholder="Contenido"
      />
      <input
        value={author}
        onChange={event => setAuthor(event.target.value)}
        placeholder="Autor (opcional)"
      />
      <button type="submit">Publicar</button>
    </form>
  )
}

export default PostForm
