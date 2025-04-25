import FeedbackForm from "@/components/feedback-form"
import { Toaster } from "@/components/ui/toaster"
import VisitCounter from "@/components/visit-counter"
import MapWrapper from "@/components/map-wrapper"
import InfoPopup from "@/components/info-popup"
import StructuredData from "@/components/structured-data"
import SeoFooter from "@/components/seo-footer"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Add structured data for SEO */}
      <StructuredData />
      <header className="bg-orange-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col items-center">
          {/* Mobile-friendly layout with stacked elements */}
          <div className="w-full flex justify-center items-center relative mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center px-8">Hindu Temples in the USA</h1>

            {/* Info button positioned to the right of the title on all screen sizes */}
            <div className="absolute right-0">
              <InfoPopup />
            </div>
          </div>

          {/* Optional subtitle that only shows on larger screens */}
          <p className="text-xs sm:text-sm text-orange-100 text-center hidden sm:block">
            An interactive map of Hindu temples across the United States
          </p>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4">
        <MapWrapper />
      </div>

      <footer className="bg-gray-100 p-6">
        <div className="container mx-auto space-y-8">
          <FeedbackForm />
          <div className="border-t pt-4">
{/*             <VisitCounter /> */}
            {/* Add SEO-rich footer */}
            <SeoFooter />
          </div>
        </div>
      </footer>

      <Toaster />
    </main>
  )
}
