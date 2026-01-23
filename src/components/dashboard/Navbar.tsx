'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface NavbarProps {
  userEmail?: string
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Daily Write
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-100"
              >
                Dashboard
              </Link>
              <Link
                href="/projects"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-100"
              >
                Projects
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-gray-500 hidden md:block dark:text-gray-400">
                {userEmail}
              </span>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
