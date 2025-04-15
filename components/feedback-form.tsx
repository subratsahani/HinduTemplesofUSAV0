"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function FeedbackForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    templeName: "",
    address: "",
    state: "",
    latitude: "",
    longitude: "",
    submitterName: "",
    submitterEmail: "",
    additionalInfo: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send the feedback data to the API route
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(access_key: "59ec66c4-6ccb-4f02-9256-b6c28fccf466",formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your contribution! We'll review your submission soon.",
        })

        // Reset form
        setFormData({
          templeName: "",
          address: "",
          state: "",
          latitude: "",
          longitude: "",
          submitterName: "",
          submitterEmail: "",
          additionalInfo: "",
        })
      } else {
        throw new Error(data.message || "Failed to submit feedback")
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again later.",
        variant: "destructive",
      })
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a Missing Temple</CardTitle>
        <CardDescription>
          Help us improve our database by submitting information about a temple that's not on our map. Your submission
          will be sent for review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="templeName">Temple Name *</Label>
              <Input id="templeName" name="templeName" value={formData.templeName} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Full Address *</Label>
            <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (if known)</Label>
              <Input
                id="latitude"
                name="latitude"
                type="text"
                placeholder="e.g. 40.7128"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (if known)</Label>
              <Input
                id="longitude"
                name="longitude"
                type="text"
                placeholder="e.g. -74.0060"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="submitterName">Your Name *</Label>
              <Input
                id="submitterName"
                name="submitterName"
                value={formData.submitterName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submitterEmail">Your Email *</Label>
              <Input
                id="submitterEmail"
                name="submitterEmail"
                type="email"
                value={formData.submitterEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Any other details about the temple that might be helpful..."
              value={formData.additionalInfo}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Temple Information"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
