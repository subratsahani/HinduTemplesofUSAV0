"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminEditModal({ temple, onSave, onCancel }) {
  const [editedTemple, setEditedTemple] = useState({ ...temple })

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedTemple((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLatLngChange = (e) => {
    const { name, value } = e.target
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      setEditedTemple((prev) => ({
        ...prev,
        [name]: numValue,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Update Google Maps link based on new lat/lng
    const updatedTemple = {
      ...editedTemple,
      googleMapsLink: `https://maps.google.com/?q=${editedTemple.latitude},${editedTemple.longitude}`,
    }
    onSave(updatedTemple)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Temple Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Temple Name</Label>
              <Input id="name" name="name" value={editedTemple.name} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={editedTemple.address} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" value={editedTemple.state} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" name="image" value={editedTemple.image} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.0001"
                  value={editedTemple.latitude}
                  onChange={handleLatLngChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.0001"
                  value={editedTemple.longitude}
                  onChange={handleLatLngChange}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
