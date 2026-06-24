import { useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Spinner } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createTodo, deleteTodo, fetchTodos, updateTodo } from '../services/api'

export default function Todos() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [editingTodo, setEditingTodo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadTodos = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchTodos(token)
      setTodos(data)
    } catch (err) {
      setError(err.message || 'Unable to load todos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadTodos()
    }
  }, [token])

  const filteredTodos = useMemo(() => {
    if (!searchQuery.trim()) {
      return todos
    }

    const lowerSearch = searchQuery.trim().toLowerCase()
    return todos.filter((todo) => {
      const titleMatch = todo.title?.toLowerCase().includes(lowerSearch)
      const memoMatch = todo.memo?.toLowerCase().includes(lowerSearch)
      return titleMatch || memoMatch
    })
  }, [searchQuery, todos])

  const resetForm = () => {
    setTitle('')
    setMemo('')
    setEditingTodo(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      if (editingTodo) {
        await updateTodo(token, editingTodo.id, { title: title.trim(), memo: memo.trim() })
      } else {
        await createTodo(token, { title: title.trim(), memo: memo.trim() })
      }
      resetForm()
      await loadTodos()
    } catch (err) {
      setError(err.message || 'Unable to save todo')
    }
  }

  const handleEdit = (todo) => {
    setEditingTodo(todo)
    setTitle(todo.title)
    setMemo(todo.memo || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (todoId) => {
    const confirmed = window.confirm('Delete this todo?')
    if (!confirmed) return

    try {
      await deleteTodo(token, todoId)
      await loadTodos()
    } catch (err) {
      setError(err.message || 'Unable to remove todo')
    }
  }

  return (
    <div className="py-4">
      <div className="row gy-4">
        <div className="col-lg-5">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>{editingTodo ? 'Edit Todo' : 'Add Todo'}</Card.Title>
              <Card.Text className="text-muted">
                {editingTodo ? 'Update your task details below.' : 'Create a new todo item and save it.'}
              </Card.Text>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="todoTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a todo title"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="todoMemo">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Optional details"
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {editingTodo ? 'Update Todo' : 'Create Todo'}
                  </Button>
                  {editingTodo && (
                    <Button variant="secondary" disabled={loading} onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="mb-1">Your Todos</h2>
              <p className="text-muted mb-0">Manage your tasks with create, edit, and delete actions.</p>
            </div>
            {loading && <Spinner animation="border" size="sm" />}
          </div>

          {filteredTodos.length === 0 && !loading ? (
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Text className="mb-0">
                  {searchQuery
                    ? 'No todos matched your search. Try a different keyword.'
                    : 'No todos yet. Add one to get started.'}
                </Card.Text>
              </Card.Body>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <Card key={todo.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Card.Title className="mb-0">{todo.title}</Card.Title>
                        {todo.completed ? (
                          <Badge bg="success">Completed</Badge>
                        ) : (
                          <Badge bg="secondary">Open</Badge>
                        )}
                      </div>
                      {todo.memo && <Card.Text className="mb-2 text-muted">{todo.memo}</Card.Text>}
                      <small className="text-muted">Created: {new Date(todo.created).toLocaleString()}</small>
                    </div>
                    <div className="d-flex gap-2 flex-column">
                      <Button size="sm" variant="outline-primary" onClick={() => handleEdit(todo)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(todo.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
