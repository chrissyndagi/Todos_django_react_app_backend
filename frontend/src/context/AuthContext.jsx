import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest, signupRequest } from '../services/api'

const AuthContext = createContext(null)
const STORAGE_TOKEN = 'authToken'
const STORAGE_USER = 'authUser'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_USER)
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token)
    } else {
      localStorage.removeItem(STORAGE_TOKEN)
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_USER)
    }
  }, [user])

  const login = async ({ username, password }) => {
    const data = await loginRequest({ username, password })
    setToken(data.token)
    setUser({ username })
    return data
  }

  const signup = async ({ username, email, password }) => {
    const data = await signupRequest({ username, password })
    setToken(data.token)
    setUser({ username, email })
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  const value = useMemo(
    () => ({ user, token, login, signup, logout, isAuthenticated: Boolean(token) }),
    [user, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
