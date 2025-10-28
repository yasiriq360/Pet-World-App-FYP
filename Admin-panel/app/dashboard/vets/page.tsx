"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { database } from "@/lib/firebase"
import { ref, onValue, remove, set } from "firebase/database"
import { Loader2, Trash2, AlertCircle, Mail, UserCircle2 } from "lucide-react"
import { toast } from "sonner"

interface VetData {
  userId: string
  username: string
  email?: string
  [key: string]: any
}

export default function VetsPage() {
  const { user, userRole } = useAuth()
  const [vets, setVets] = useState<Record<string, VetData>>({})
  const [loading, setLoading] = useState(true)
  const [debug, setDebug] = useState({ enabled: false, info: "" })

  const isAdmin = userRole === "admin"

  useEffect(() => {
    if (!user || !isAdmin) return

    const vetRef = ref(database, "Vet")
    onValue(vetRef, (snapshot) => {
      const data: Record<string, VetData> = {}
      let debugInfo = "Firebase Vets Data:\n"

      snapshot.forEach((child) => {
        const vetId = child.key!
        const vet = child.val()

        debugInfo += `Vet ID: ${vetId} | Username: ${vet.username || 'Unknown'}\n`
        
        data[vetId] = {
          userId: vetId,
          username: vet.username || "Unknown",
          email: vet.email || "",
          ...vet
        }
      })

      setDebug(prev => ({ ...prev, info: debugInfo }))
      setVets(data)
      setLoading(false)
    })
  }, [user, isAdmin])

  const deleteVet = async (vetId: string, vetName: string) => {
    if (!confirm(`Are you sure you want to delete ${vetName}?`)) return
    
    try {
      const vetRef = ref(database, `Vet/${vetId}`)
      await remove(vetRef)
      toast.success(`${vetName} has been deleted`)
    } catch (error) {
      console.error("Error deleting vet:", error)
      toast.error("Failed to delete vet")
    }
  }

  const blockVet = async (vetId: string) => {
    const vetBlockRef = ref(database, `Vet/${vetId}/block`)
    await set(vetBlockRef, true)
  }

  const unblockVet = async (vetId: string) => {
    const vetBlockRef = ref(database, `Vet/${vetId}/block`)
    await set(vetBlockRef, false)
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Manage Veterinarians</h1>
        <p className="text-muted-foreground">View and delete veterinarian accounts</p>
      </div>
      
      {debug.enabled && debug.info && (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="font-medium">Debug Information</h3>
          </div>
          <pre className="text-xs whitespace-pre-wrap max-h-40 overflow-auto">{debug.info}</pre>
          <Button variant="outline" size="sm" className="mt-2"
            onClick={() => setDebug(prev => ({ ...prev, enabled: false }))}>
            Hide Debug Info
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(vets).map(([vetId, vet]) => {
          // Generate a unique but consistent color for each vet based on their ID
          const colorIndex = vetId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
          const colorClasses = [
            'from-blue-500 to-indigo-600',
            'from-emerald-500 to-teal-600',
            'from-purple-500 to-violet-600',
            'from-rose-500 to-pink-600',
            'from-amber-500 to-orange-600'
          ];
          
          return (
            <Card 
              key={vetId} 
              className="overflow-hidden transition-all duration-300 hover:shadow-lg group relative"
            >
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${colorClasses[colorIndex]}`}></div>
              <CardHeader className="pb-2 pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${colorClasses[colorIndex]} text-white`}>
                      {vet.username.charAt(0).toUpperCase()}
                    </div>
                    <CardTitle className="group-hover:translate-x-1 transition-transform duration-300">
                      {vet.username}
                    </CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                    onClick={() => deleteVet(vetId, vet.username)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{vet.email || "No email"}</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <UserCircle2 className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Status: {vet.verified || "unverified"}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex gap-2">
                  <p className="text-xs text-gray-400 flex-1">ID: {vetId.substring(0, 8)}...</p>
                  {vet.block === true ? (
                    <Button size="sm" variant="destructive" onClick={() => unblockVet(vetId)}>
                      Unblock
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => blockVet(vetId)}>
                      Block
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(vets).length === 0 && (
        <div className="text-center p-10 border rounded-lg bg-gray-50">
          <UserCircle2 className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="text-muted-foreground">No vets found in the database</p>
        </div>
      )}
    </div>
  )
}
