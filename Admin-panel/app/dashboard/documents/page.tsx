"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref as dbRef, onValue, set } from "firebase/database"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Eye,
  Download,
  Check,
  X,
  FileText,
  Loader2
} from "lucide-react"

interface DocumentInfo {
  downloadUrl: string
  id: string
  name: string
  type: string
}

interface VetData {
  userId: string
  username: string
  verified?: string
  profileImage?: string
  clinicDocuments?: DocumentInfo
  medicalDocuments?: DocumentInfo
  PVMC?: boolean
  [key: string]: any
}

export default function DocumentsPage() {
  const { user, userRole } = useAuth()
  const [vets, setVets] = useState<Record<string, VetData>>({})
  const [loading, setLoading] = useState(true)
  const [viewingDoc, setViewingDoc] = useState<{ url: string, name: string, type: string } | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [iframeError, setIframeError] = useState(false)

  const isAdmin = userRole === "admin"

  useEffect(() => {
    if (!user || !isAdmin) return

    const vetRef = dbRef(database, "Vet")

    const unsubscribe = onValue(vetRef, (snapshot) => {
      const vetsData: Record<string, VetData> = {}

      snapshot.forEach((child) => {
        const vetId = child.key!
        const vet = child.val()

        const clinicDoc = vet["Clinic documents"] || vet.clinicDocuments
        const medicalDoc = vet["Medical Documents"] || vet.medicalDocuments

        // Avoid overriding cleaned keys
        vetsData[vetId] = {
          ...vet,
          userId: vetId,
          username: vet.username || "Unknown",
          verified: vet.verified || "unverified",
          profileImage: vet.profileImage,
          clinicDocuments: clinicDoc,
          medicalDocuments: medicalDoc,
        }
      })

      setVets(vetsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, isAdmin])

  const updateVerificationStatus = async (vetId: string, status: "verified" | "unverified") => {
    const vetVerifiedRef = dbRef(database, `Vet/${vetId}/verified`)
    await set(vetVerifiedRef, status)
  }

  const renderDocPreview = (
    label: string,
    document?: DocumentInfo,
    vetId?: string
  ) => {
    if (!document || !document.downloadUrl) return null

    const docId = `${vetId}-${label}`
    const isImage = document.type.startsWith("image/")

    const handleOpenInNewTab = (e: React.MouseEvent) => {
      e.stopPropagation()
      window.open(document.downloadUrl, "_blank")
    }

    const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation()
      const link = window.document.createElement('a')
      link.href = document.downloadUrl
      link.download = document.name || 'document'
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    }

    return (
      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
        {isImage && !imageErrors[docId] ? (
          <img
            src={document.downloadUrl}
            alt={label}
            className="max-h-40 max-w-full object-contain"
            onError={() => setImageErrors(prev => ({ ...prev, [docId]: true }))}
          />
        ) : (
          <FileText className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">{document.name || label}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
            <Eye className="mr-2 h-4 w-4" />
            View in New Tab
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
      <p className="text-muted-foreground">
        Review and verify documents submitted by veterinarians.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(vets).length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            No veterinarians with documents found.
          </p>
        ) : (
          Object.values(vets).map((vet) => (
            <Card key={vet.userId} className="overflow-hidden relative">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium flex-1 pr-4">{vet.username}</CardTitle>
                <div className="flex flex-col gap-2 items-end min-w-fit">
                  <Badge variant={vet.verified === "verified" ? "default" : "destructive"}>
                    {vet.verified}
                  </Badge>
                  {vet.PVMC === true && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="bg-gradient-to-r from-blue-500 to-green-400 text-white shadow-md px-3 py-1 flex items-center gap-1 text-xs font-semibold border-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Verified by the PVMC
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>This veterinarian is officially verified by the Pakistan Veterinary Medical Council (PVMC).</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {renderDocPreview("Clinic Documents", vet.clinicDocuments, vet.userId)}
                  {renderDocPreview("Medical Documents", vet.medicalDocuments, vet.userId)}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {vet.verified === "unverified" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateVerificationStatus(vet.userId, "verified")}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                )}
                {vet.verified === "verified" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateVerificationStatus(vet.userId, "unverified")}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Unverify
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!viewingDoc} onOpenChange={() => { setViewingDoc(null); setIframeError(false); }}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          {viewingDoc && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingDoc.name}</DialogTitle>
              </DialogHeader>
              <div className="relative w-full h-full flex items-center justify-center">
                {viewingDoc.type.startsWith("image/") ? (
                  <img
                    src={viewingDoc.url}
                    alt="Document Preview"
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : (
                  !iframeError ? (
                    <iframe
                      src={viewingDoc.url}
                      title="Document Preview"
                      className="w-full h-[70vh]"
                      style={{ border: "none" }}
                      onError={() => setIframeError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-[70vh] gap-4">
                      <p className="text-center text-red-500 font-medium">Preview unavailable. The file host does not allow embedding.</p>
                      <Button onClick={() => window.open(viewingDoc.url, "_blank")}>View in New Tab</Button>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
