import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Info } from "lucide-react"
import FeedbackForm from "@/components/feedback-form"
import { Toaster } from "@/components/ui/toaster"
import VisitCounter from "@/components/visit-counter"
import MapWrapper from "@/components/map-wrapper"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="bg-orange-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Hindu Temples in the USA</h1>
          <div className="ml-auto">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="text-white hover:text-orange-200 transition"
                  aria-label="Info"
                >
                  <Info className="w-6 h-6" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <p>This map shows Hindu temples across the USA. You can zoom in, click markers, and submit feedback below.</p>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4">
        <MapWrapper />
      </div>

      <footer className="bg-gray-100 p-6">
        <div className="container mx-auto space-y-8">
          <FeedbackForm />
          <div className="border-t pt-4">
            <VisitCounter />
          </div>
        </div>
      </footer>

      <Toaster />
    </main>
  )
}
