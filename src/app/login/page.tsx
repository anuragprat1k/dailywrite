import { LoginButton } from '@/components/auth/LoginButton'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to WriteFlow
            </h1>
            <p className="text-gray-600">
              Your personal writing companion for blogs, novels, and more.
            </p>
          </div>

          <div className="space-y-4">
            <LoginButton />
          </div>

          <p className="mt-8 text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
