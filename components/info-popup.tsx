"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function InfoPopup() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-white hover:bg-orange-700 rounded-full"
        aria-label="Information about this website"
      >
        <Info className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>About Hindu Temples in USA Map</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-left text-sm text-muted-foreground">
            <p>
              This interactive map showcases Hindu temples across the United States, helping devotees and visitors
              locate places of worship.
            </p>

            <div>
              <h3 className="font-medium text-foreground mb-1">How You Can Help:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Submit information about temples not yet on our map</li>
                <li>Provide corrections to existing temple information</li>
                <li>Share this resource with your community</li>
              </ul>
            </div>

            <p>
              Use the feedback form at the bottom of the page to submit new temple information. Your contributions help
              make this resource more comprehensive for the Hindu community.
            </p>

            <p>All submissions are reviewed before being added to the map. Thank you for your support!</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
