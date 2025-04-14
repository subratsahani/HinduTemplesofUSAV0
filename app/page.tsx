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
