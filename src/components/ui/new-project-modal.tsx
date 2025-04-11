"use client"

import type React from "react"
import { useState } from "react"
import { Github, Info, Upload } from "lucide-react"

import { Button } from "./button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./dialog"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description: string; repoUrl?: string }) => void
}

export function NewProjectModal({ open, onOpenChange, onSubmit }: NewProjectModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [repoUrl, setRepoUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, description, repoUrl: repoUrl || undefined })
    setName("")
    setDescription("")
    setRepoUrl("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-gradient-to-b from-[#111827] to-[#0f1623] border-[#1f2937] text-slate-100 p-0 overflow-hidden shadow-xl shadow-black/40 rounded-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-7 pt-7 pb-3">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <DialogTitle className="text-xl font-medium text-slate-100 tracking-tight">
                Create a New Project
              </DialogTitle>
            </div>
            <p className="text-slate-400 text-sm mt-2 ml-5">Configure your project settings and repository details</p>
          </DialogHeader>

          <div className="px-7 py-5">
            <div className="space-y-6">
              <div className="space-y-2.5">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2.5"></div>
                  <Label htmlFor="name" className="text-sm font-medium text-slate-300 flex items-center">
                    Name
                    <Info className="h-3.5 w-3.5 text-slate-500 ml-1.5 hover:text-blue-400 transition-colors" />
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter project name"
                    className="bg-[#1a2236] border-[#2d3748] focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 text-slate-100 h-11 pl-4 shadow-sm shadow-black/10"
                    required
                  />
                  <div className="absolute inset-0 rounded-md pointer-events-none border border-blue-500/0 focus-within:border-blue-500/20"></div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2.5"></div>
                  <Label htmlFor="description" className="text-sm font-medium text-slate-300 flex items-center">
                    Description
                    <Info className="h-3.5 w-3.5 text-slate-500 ml-1.5 hover:text-blue-400 transition-colors" />
                  </Label>
                </div>
                <div className="relative">
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    className="bg-[#1a2236] border-[#2d3748] focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 text-slate-100 min-h-[110px] resize-none shadow-sm shadow-black/10"
                    required
                  />
                  <div className="absolute inset-0 rounded-md pointer-events-none border border-blue-500/0 focus-within:border-blue-500/20"></div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2.5"></div>
                  <Label htmlFor="repo" className="text-sm font-medium text-slate-300 flex items-center">
                    GitHub Repository URL
                    <Info className="h-3.5 w-3.5 text-slate-500 ml-1.5 hover:text-blue-400 transition-colors" />
                  </Label>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Github className="h-4 w-4" />
                  </div>
                  <Input
                    id="repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="bg-[#1a2236] border-[#2d3748] focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 text-slate-100 h-11 pl-10 shadow-sm shadow-black/10"
                  />
                  <div className="absolute inset-0 rounded-md pointer-events-none border border-blue-500/0 focus-within:border-blue-500/20"></div>
                </div>
                <p className="text-xs text-slate-500 ml-5">Optional: Link an existing GitHub repository</p>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-[#0c111d] border-t border-[#1f2937] px-7 py-4 flex items-center justify-between">
            <div className="text-xs text-slate-500">All fields marked with a blue dot are required</div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#2d3748] text-slate-300 hover:bg-[#1a2236] hover:text-slate-100 h-10 px-4 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 flex items-center gap-2 shadow-md shadow-blue-900/30 transition-all duration-200"
              >
                <Upload className="h-4 w-4" />
                Create Project
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 