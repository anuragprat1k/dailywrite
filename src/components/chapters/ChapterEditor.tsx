'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAutoSave } from '@/lib/hooks/useAutoSave'
import { countWords } from '@/lib/utils/stats'
import { Chapter } from '@/types/database'

interface ChapterEditorProps {
  chapter: Chapter
  projectId: string
  backUrl?: string
}

export function ChapterEditor({ chapter, projectId, backUrl }: ChapterEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(chapter.content)
  const [title, setTitle] = useState(chapter.title)

  // Track the word count from the last save to compute delta
  const lastSavedWordCountRef = useRef(chapter.word_count)

  const wordCount = countWords(content)

  const saveContent = useCallback(async (data: string) => {
    const supabase = createClient()
    const newWordCount = countWords(data)

    // Calculate the delta (can be positive or negative)
    const delta = newWordCount - lastSavedWordCountRef.current

    // Update chapter
    await supabase
      .from('chapters')
      .update({
        content: data,
        word_count: newWordCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chapter.id)

    // Update project's updated_at
    await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', projectId)

    // Update writing session for today with the net delta
    if (delta !== 0) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const today = new Date().toISOString().split('T')[0]

        const { data: existing } = await supabase
          .from('writing_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single()

        if (existing) {
          const session = existing as { id: string; words_written: number }
          await supabase
            .from('writing_sessions')
            .update({ words_written: Math.max(0, session.words_written + delta) })
            .eq('id', session.id)
        } else if (delta > 0) {
          // Only create a new session if we're adding words
          await supabase
            .from('writing_sessions')
            .insert({
              user_id: user.id,
              date: today,
              words_written: delta,
            })
        }
      }
    }

    // Update ref after successful save
    lastSavedWordCountRef.current = newWordCount
  }, [chapter.id, projectId])

  const { isSaving, lastSaved, saveNow } = useAutoSave({
    data: content,
    onSave: saveContent,
    delay: 2000,
  })

  // Handle Cmd/Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveNow()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [saveNow])

  const handleTitleBlur = async () => {
    if (title.trim() !== chapter.title) {
      const supabase = createClient()
      await supabase
        .from('chapters')
        .update({ title: title.trim(), updated_at: new Date().toISOString() })
        .eq('id', chapter.id)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={() => router.push(backUrl || `/projects/${projectId}`)}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="text-lg font-medium text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full"
            placeholder="Chapter title..."
          />
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 flex-shrink-0">
          <span>{wordCount.toLocaleString()} words</span>
          <span className="flex items-center gap-1">
            {isSaving ? (
              <>
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Saving...
              </>
            ) : lastSaved ? (
              <>
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Saved
              </>
            ) : null}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full min-h-[calc(100vh-200px)] text-lg leading-relaxed text-gray-800 bg-transparent border-none outline-none resize-none focus:ring-0"
          placeholder="Start writing..."
          autoFocus
        />
      </main>
    </div>
  )
}
