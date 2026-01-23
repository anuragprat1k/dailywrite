'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Chapter } from '@/types/database'
import { Button } from '@/components/ui/Button'

interface ChapterListProps {
  projectId: string
  chapters: Chapter[]
}

export function ChapterList({ projectId, chapters }: ChapterListProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleCreateChapter = async () => {
    if (!newTitle.trim()) return

    setIsCreating(true)
    const supabase = createClient()

    try {
      const maxOrder = chapters.length > 0
        ? Math.max(...chapters.map((c) => c.sort_order))
        : -1

      const { data, error } = await supabase
        .from('chapters')
        .insert({
          project_id: projectId,
          title: newTitle.trim(),
          sort_order: maxOrder + 1,
        })
        .select()
        .single()

      if (error) throw error

      setNewTitle('')
      router.refresh()
      router.push(`/projects/${projectId}/${data.id}`)
    } catch (error) {
      console.error('Error creating chapter:', error)
      alert('Failed to create chapter')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteChapter = async (chapterId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this chapter?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId)

    if (error) {
      console.error('Error deleting chapter:', error)
      alert('Failed to delete chapter')
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New chapter title..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:placeholder-gray-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreateChapter()
          }}
        />
        <Button onClick={handleCreateChapter} disabled={isCreating || !newTitle.trim()}>
          {isCreating ? 'Adding...' : 'Add Chapter'}
        </Button>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No chapters yet. Add your first chapter above.
        </div>
      ) : (
        <div className="space-y-2">
          {chapters
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((chapter, index) => (
              <Link
                key={chapter.id}
                href={`/projects/${projectId}/${chapter.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-6">{index + 1}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{chapter.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {chapter.word_count.toLocaleString()} words
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteChapter(chapter.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete chapter"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}
