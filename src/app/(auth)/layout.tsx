import React from "react"

export const metadata = {
  title: "Authentication",
  description: "Login and register for FlowCode",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  )
} 