import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  try {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser && storedUser !== 'undefined') {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  } catch (err) {
    console.log('Auth storage error:', err)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } finally {
    setLoading(false)
  }
}, [])

  const login = (userData, tokenData) => {
  if (!userData || !tokenData) return
  setUser(userData)
  setToken(tokenData)
  localStorage.setItem('token', tokenData)
  localStorage.setItem('user', JSON.stringify(userData))
}
  

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}