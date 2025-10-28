"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useEffect, useState } from "react"
import { Loader2, Users, FileText, Shield } from "lucide-react"

export default function DashboardPage() {
  const { user, userRole } = useAuth()
  const [stats, setStats] = useState({
    totalVets: 0,
    totalDocuments: 0,
    totalPolicies: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count vets from the Vet collection
        const vetsRef = ref(database, "Vet")
        onValue(vetsRef, (snapshot) => {
          let vetCount = 0
          let docCount = 0
          snapshot.forEach((child) => {
            vetCount++
            const vet = child.val()
            if (vet["Clinic documents"] || vet.clinicDocuments) docCount++
            if (vet["Medical Documents"] || vet.medicalDocuments) docCount++
          })
          setStats((prev) => ({ ...prev, totalVets: vetCount, totalDocuments: docCount }))
        })

        // Count policies
        const policiesRef = ref(database, "policies")
        onValue(policiesRef, (snapshot) => {
          let policyCount = 0
          snapshot.forEach(() => {
            policyCount++
          })
          setStats((prev) => ({ ...prev, totalPolicies: policyCount }))
          setLoading(false)
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email}! You are logged in as {userRole}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden relative hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Veterinarians</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalVets}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered veterinarians in the system</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground mt-1">Documents uploaded by veterinarians</p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
