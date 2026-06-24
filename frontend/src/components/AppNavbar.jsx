import { useEffect, useRef, useState } from 'react'
import { Button, Container, Form, Nav, Navbar } from 'react-bootstrap'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RECENT_SEARCHES_KEY = 'todoRecentSearches'
const MAX_RECENT_SEARCHES = 5

export default function AppNavbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    setQuery(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveToRecent = (searchTerm) => {
    const trimmed = searchTerm.trim().toLowerCase()
    if (!trimmed) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed)
      const updated = [searchTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const handleQueryChange = (event) => {
    const value = event.target.value
    setQuery(value)
    setShowSuggestions(true)

    // Auto-search as user types
    if (location.pathname !== '/todos') {
      if (value.trim()) {
        navigate(`/todos?search=${encodeURIComponent(value)}`)
      } else {
        navigate('/todos')
      }
    } else {
      if (value.trim()) {
        setSearchParams({ search: value })
      } else {
        setSearchParams({})
      }
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = query.trim()

    if (trimmed) {
      saveToRecent(trimmed)
      setShowSuggestions(false)
    }
  }

  const handleRecentSearch = (searchTerm) => {
    setQuery(searchTerm)
    saveToRecent(searchTerm)
    setShowSuggestions(false)

    if (location.pathname !== '/todos') {
      navigate(`/todos?search=${encodeURIComponent(searchTerm)}`)
    } else {
      setSearchParams({ search: searchTerm })
    }
  }

  const handleClearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  }

  return (
    <Navbar expand="lg" bg="light" className="shadow-sm">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          TodosApp
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/todos">
              Todos
            </Nav.Link>
          </Nav>
          <div className="position-relative d-flex me-3 my-2 my-lg-0">
            <Form className="d-flex" onSubmit={handleSubmit}>
              <div className="position-relative w-100">
                <Form.Control
                  type="search"
                  placeholder="Search todos..."
                  value={query}
                  onChange={handleQueryChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="me-2"
                  aria-label="Search todos"
                  ref={searchInputRef}
                  autoComplete="off"
                />
                {showSuggestions && recentSearches.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="position-absolute top-100 start-0 w-100 bg-white border rounded shadow-sm mt-1 z-3"
                    style={{ minWidth: '250px' }}
                  >
                    <div className="p-2">
                      <small className="d-block text-muted mb-2">Recent Searches</small>
                      {recentSearches.map((search, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center py-1">
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-start text-decoration-none p-0"
                            onClick={() => handleRecentSearch(search)}
                          >
                            {search}
                          </button>
                        </div>
                      ))}
                      <hr className="my-2" />
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-danger p-0"
                        onClick={handleClearRecent}
                      >
                        Clear history
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Form>
            <Button type="submit" variant="outline-success" onClick={handleSubmit}>
              Search
            </Button>
          </div>
          <Nav className="ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                <span className="me-3 text-secondary">Hi, {user?.username}</span>
                <Button variant="outline-danger" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={NavLink} to="/signup">
                  Signup
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
