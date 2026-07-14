const API = 'https://task-manager-backend-b7ou.onrender.com'
import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [editingId, setEditingId] = useState(null)   // which task is being edited
  const [editingTitle, setEditingTitle] = useState('') // the new title value
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)

  // AUTH FORM STATE
  const [isLogin, setIsLogin] = useState(true)  // toggle login/register
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) fetchTasks()
  }, [token])

  // ─── AUTH ───────────────────────────────────────────
  const handleAuth = async () => {
    setError('')
    const url = isLogin
      ? `${API}/api/auth/login`
      : `${API}/api/auth/register`

    const body = isLogin
      ? { email, password }
      : { name, email, password }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message)
      return
    }

    // Save token and user to localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
    setTasks([])
    // clear all form fields
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setIsLogin(true)  // always show login page after logout
  }

  // ─── TASKS ──────────────────────────────────────────
  const fetchTasks = async () => {
    const res = await fetch(`${API}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setTasks(data)
  }

  const addTask = async () => {
    if (!title.trim()) return
    await fetch(`${API}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    })
    setTitle('')
    fetchTasks()
  }

  const toggleTask = async (id) => {
    await fetch(`${API}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchTasks()
  }

  const deleteTask = async (id) => {
    await fetch(`${API}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchTasks()
  }

   // START editing a task
  const startEdit = (task) => {
    setEditingId(task._id)        // mark which task is being edited
    setEditingTitle(task.title)   // prefill input with current title
  }

  // SAVE the updated task
  const saveEdit = async (id) => {
    if (!editingTitle.trim()) return
    await fetch(`${API}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingTitle })
    })
    setEditingId(null)    // exit edit mode
    setEditingTitle('')
    fetchTasks()
  }

   // CANCEL editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const completedCount = tasks.filter(t => t.completed).length

  // ─── AUTH SCREEN ────────────────────────────────────
  if (!token) {
    return (
      <div className="container">
        <h1>📝 Task Manager</h1>
        <p className="subtitle">{isLogin ? 'Welcome back!' : 'Create your account'}</p>

        <div className="auth-form">
          {!isLogin && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          />

          {error && <p className="error">{error}</p>}

          <button className="auth-btn" onClick={handleAuth}>
            {isLogin ? 'Login' : 'Register'}
          </button>

          <p className="toggle-auth">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => { setIsLogin(!isLogin); setError('') }}>
              {isLogin ? ' Register' : ' Login'}
            </span>
          </p>
        </div>
      </div>
    )
  }

  // ─── TASK SCREEN ────────────────────────────────────
  return (
    <div className="container">
      <div className="header-row">
        <h1>📝 Task Manager</h1>
        <div className="user-info">
          <span>👋 {user?.name}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask}>+ Add</button>
      </div>

      {tasks.length > 0 && (
        <div className="stats">
          <p>Total: <span>{tasks.length}</span></p>
          <p>Completed: <span>{completedCount}</span></p>
          <p>Remaining: <span>{tasks.length - completedCount}</span></p>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p>No tasks yet. Add one above!</p>
        </div>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task._id} className={task.completed ? 'completed' : ''}>
              <div
                className={`checkbox ${task.completed ? 'checked' : ''}`}
                onClick={() => toggleTask(task._id)}
              >
                {task.completed && '✓'}
              </div>
              {editingId === task._id ? (
                <>
                  <input
                    className="edit-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(task._id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    autoFocus
                  />
                  <button className="save-btn" onClick={() => saveEdit(task._id)}>save</button>
                  <button className="cancel-btn" onClick={cancelEdit}>✖</button>
                </>
              ) : (
                <>
              <span className="task-title">{task.title}</span>
              <button className="edit-btn" onClick={() => startEdit(task)}>✏️</button>
              <button className="delete-btn" onClick={() => deleteTask(task._id)}>❌</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
export default App