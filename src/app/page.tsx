import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">WriteFlow</div>
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Your Writing Journey
            <br />
            <span className="text-blue-600">Starts Here</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            A distraction-free writing environment for bloggers, novelists, and creative writers.
            Track your progress, build writing streaks, and bring your stories to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize Projects</h3>
            <p className="text-gray-600">
              Create projects for blogs, novels, or essays. Organize your work into chapters and sections.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              See your writing stats, build streaks, and visualize your progress over time.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Focus on Writing</h3>
            <p className="text-gray-600">
              A minimal, distraction-free editor with auto-save so you can focus on what matters.
            </p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-100">
        <p className="text-center text-gray-500 text-sm">
          WriteFlow - Built for writers who want to focus on writing.
        </p>
      </footer>
    </div>
  )
}
