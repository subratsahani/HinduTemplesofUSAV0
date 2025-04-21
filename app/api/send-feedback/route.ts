import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { templeName, address, state, latitude, longitude, submitterName, submitterEmail, additionalInfo } = data

    // In a production environment, you would use a service like SendGrid, Mailgun, etc.
    // For now, we'll just log the data and return a success response
    console.log("Feedback received:", {
      to: "sahani_90@rediffmail.com",
      subject: "New Temple Submission",
      body: `
        Temple Name: ${templeName}
        Address: ${address}
        State: ${state}
        Coordinates: ${latitude}, ${longitude}
        Submitted by: ${submitterName} (${submitterEmail})
        Additional Info: ${additionalInfo}
      `,
    })

    return NextResponse.json({ success: true, message: "Feedback received" })
  } catch (error) {
    console.error("Error processing feedback:", error)
    return NextResponse.json({ success: false, message: "Failed to process feedback" }, { status: 500 })
  }
}
