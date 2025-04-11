"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, Bell, Home, Settings, Users } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* App Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>

      {/* App Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-800 bg-gray-900 hidden md:block">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                <span className="text-xs font-medium">N</span>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                NexusAI
              </span>
            </div>

            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-white bg-gray-800">
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
                <BarChart3 className="mr-2 h-5 w-5" />
                Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
                <Users className="mr-2 h-5 w-5" />
                Team
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
              <p className="text-gray-400">
                This is a placeholder for your application dashboard. Your actual app content would go here.
              </p>
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Active Users</h3>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">2,845</div>
                <div className="text-sm text-green-400">+12.5% from last week</div>
              </div>

              {/* Card 2 */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Network Status</h3>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">98.7%</div>
                <div className="text-sm text-green-400">+2.1% from last week</div>
              </div>

              {/* Card 3 */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Processing Power</h3>
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">1.2 PH/s</div>
                <div className="text-sm text-yellow-400">-0.3% from last week</div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Recent Activity</h2>

              <div className="space-y-4">
                {/* Activity Item 1 */}
                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex-shrink-0 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">New user registered</div>
                    <div className="text-sm text-gray-400">John Doe joined the platform</div>
                    <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex-shrink-0 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium">Network update completed</div>
                    <div className="text-sm text-gray-400">System upgraded to version 2.4.0</div>
                    <div className="text-xs text-gray-500 mt-1">5 hours ago</div>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex-shrink-0 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-medium">Processing node added</div>
                    <div className="text-sm text-gray-400">New node added to the network</div>
                    <div className="text-xs text-gray-500 mt-1">1 day ago</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  View All Activity
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 