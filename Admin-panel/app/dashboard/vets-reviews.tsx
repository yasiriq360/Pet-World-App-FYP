"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref as dbRef, onValue } from "firebase/database"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star } from "lucide-react"

interface Review {
  comment: string
  rating: number
  timestamp: number
  userId: string
  userImage?: string
  userName: string
}

interface VetData {
  userId: string
  username: string
  profileImage?: string
  reviews?: Record<string, Review>
  verified?: string
  [key: string]: any
}

export default function VetsReviewsPage() {
  const { user, userRole } = useAuth()
  const [vets, setVets] = useState<Record<string, VetData>>({})
  const [loading, setLoading] = useState(true)

  const isAdmin = userRole === "admin"

  useEffect(() => {
    if (!user || !isAdmin) return

    const vetRef = dbRef(database, "Vet")
    const unsubscribe = onValue(vetRef, (snapshot) => {
      const vetsData: Record<string, VetData> = {}
      snapshot.forEach((child) => {
        const vetId = child.key!
        const vet = child.val()
        vetsData[vetId] = {
          ...vet,
          userId: vetId,
          username: vet.username || "Unknown",
          profileImage: vet.profileImage,
          reviews: vet.reviews || {},
          verified: vet.verified || "unverified",
        }
      })
      setVets(vetsData)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user, isAdmin])

  if (!isAdmin) {
    return <div className="p-6">You do not have access to this page.</div>
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
      <h1 className="text-3xl font-bold tracking-tight">Vet Reviews</h1>
      <p className="text-muted-foreground mb-6">
        See all reviews and ratings given by pet parents for each veterinarian.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(vets).map((vet) => {
          const reviewsArr = vet.reviews ? Object.values(vet.reviews) : []
          const avgRating =
            reviewsArr.length > 0
              ? (
                  reviewsArr.reduce((sum, r) => sum + (r.rating || 0), 0) /
                  reviewsArr.length
                ).toFixed(1)
              : null
          return (
            <Card key={vet.userId} className="overflow-hidden relative">
              <CardHeader className="flex flex-col items-start gap-2 pb-2">
                <div className="flex items-center gap-3">
                  {vet.profileImage && (
                    <img
                      src={vet.profileImage}
                      alt={vet.username}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  )}
                  <CardTitle className="text-lg font-semibold">{vet.username}</CardTitle>
                  <Badge variant={vet.verified === "verified" ? "default" : "destructive"}>
                    {vet.verified}
                  </Badge>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 flex">
                      {Array.from({ length: Math.round(Number(avgRating)) }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 stroke-yellow-500" />
                      ))}
                    </span>
                    <span className="ml-2 text-sm font-medium text-muted-foreground">
                      {avgRating} / 5 ({reviewsArr.length} review{reviewsArr.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {reviewsArr.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviewsArr
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((review, idx) => (
                        <div key={idx} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-1">
                            {review.userImage ? (
                              <img
                                src={review.userImage}
                                alt={review.userName}
                                className="w-7 h-7 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                {review.userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-sm">{review.userName}</span>
                            <span className="flex text-yellow-500 ml-2">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 stroke-yellow-500" />
                              ))}
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                              {new Date(review.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 pl-9">
                            {review.comment}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 