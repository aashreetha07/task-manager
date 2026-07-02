/*export function setupCounter(element) {
  let counter = 0
  const setCounter = (count) => {
    counter = count
    element.innerHTML = `Count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}*/
/*import { useState, useEffect } from 'react'
import './style.css'

function App() {
  // STATE — variables that React watches for changes
  const [tasks, setTasks] = useState([])       // stores all tasks
  const [title, setTitle] = useState('')        // stores input value

  // FETCH all tasks from backend when page loads
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:5000/api/tasks')
    const data = await res.json()
    setTasks(data)
  }

  // ADD a new task
  const addTask = async () => {
    if (!title) return // don't add empty tasks
    await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
    setTitle('')      // clear input
    fetchTasks()      // refresh list
  }

  // TOGGLE task complete/incomplete
  const toggleTask = async (id) => {
    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'PATCH'
    })
    fetchTasks()
  }

  // DELETE a task
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'DELETE'
    })
    fetchTasks()
  }

  return (
    <div className="container">
      <h1>📝 Task Manager</h1>

      //{/* INPUT to add new task 
      <div className="input-row">
        <input
          type="text"
          placeholder="Enter a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask}>Add</button>
      </div>

      {/* TASK LIST 
      <ul>
        {tasks.map(task => (
          <li key={task._id} className={task.completed ? 'completed' : ''}>
            <span onClick={() => toggleTask(task._id)}>{task.title}</span>
            <button onClick={() => deleteTask(task._id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App  */
import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
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
      ? 'http://localhost:5000/api/auth/login'
      : 'http://localhost:5000/api/auth/register'

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
    const res = await fetch('http://localhost:5000/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setTasks(data)
  }

  const addTask = async () => {
    if (!title.trim()) return
    await fetch('http://localhost:5000/api/tasks', {
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
    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchTasks()
  }

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchTasks()
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
              <span className="task-title">{task.title}</span>
              <button className="delete-btn" onClick={() => deleteTask(task._id)}>❌</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App