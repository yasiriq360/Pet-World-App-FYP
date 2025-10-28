"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { auth, database } from "@/lib/firebase"
import { ref, get, set } from "firebase/database"
import { useRouter } from "next/navigation"

type UserRole = "admin" | "vet" | null

interface AuthContextType {
  user: User | null
  userRole: UserRole
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, role: "admin" | "vet") => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Get user role from database
        const userRef = ref(database, `users/${user.uid}`)
        const snapshot = await get(userRef)
        if (snapshot.exists()) {
          setUserRole(snapshot.val().role)
        }
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, role: "admin" | "vet") => {
    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Save user role in database
      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        role: role,
        createdAt: new Date().toISOString(),
      })

      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await signOut(auth)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
