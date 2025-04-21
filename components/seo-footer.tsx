export default function SeoFooter() {
  return (
    <div className="text-sm text-gray-500 mt-8 border-t pt-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">About Hindu Temples USA Map</h3>
            <p className="mb-2">
              Our mission is to create the most comprehensive directory of Hindu temples across the United States,
              helping devotees and visitors easily locate places of worship.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Popular Temple Locations</h3>
            <ul className="space-y-1">
              <li>Hindu Temples in California</li>
              <li>Hindu Temples in Texas</li>
              <li>Hindu Temples in New York</li>
              <li>Hindu Temples in New Jersey</li>
              <li>Hindu Temples in Illinois</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Temple Types</h3>
            <ul className="space-y-1">
              <li>BAPS Swaminarayan Temples</li>
              <li>Shiva Temples</li>
              <li>Vishnu Temples</li>
              <li>Ganesh Temples</li>
              <li>Durga Temples</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} Hindu Temples USA Map. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
