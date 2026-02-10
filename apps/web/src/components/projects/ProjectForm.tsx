'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Project } from '@/types/database'

interface ProjectFormProps {
  project?: Project
  mode: 'create' | 'edit'
}

const PROJECT_TYPES = [
  { value: 'blog', label: 'Blog' },
  { value: 'novel', label: 'Novel' },
  { value: 'essay', label: 'Essay' },
  { value: 'other', label: 'Other' },
]

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    type: project?.type || 'blog',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      if (mode === 'create') {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            type: formData.type,
          })
          .select()
          .single()

        if (error) throw error
        router.push(`/projects/${data.id}`)
      } else if (project) {
        const { error } = await supabase
          .from('projects')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            type: formData.type,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project.id)

        if (error) throw error
        router.push(`/projects/${project.id}`)
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:placeholder-gray-400"
          placeholder="Enter project title"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:placeholder-gray-400"
          placeholder="What's this project about?"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Type
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
        >
          {PROJECT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
