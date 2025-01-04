'use client'

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { apiRequest, createRequestConfig } from '@/api/config/apiConfig'

export default function ForgotPassword({ isPublic = true }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const config = createRequestConfig('POST', { email })
      await apiRequest('/auth/forgot-password-api.php', config)
      
      setIsSuccess(true)
      toast.success('Reset instructions sent to your email')
    } catch (err) {
      setError(err.message || 'Failed to process request')
      toast.error(err.message || 'Failed to process request')
    } finally {
      setIsLoading(false)
    }
  }

  // Render different layouts based on context
  const renderContent = () => (
    <>
      <div className="text-center mb-8">
        <motion.div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500 mb-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : (
            <Mail className="w-8 h-8 text-white" />
          )}
        </motion.div>
        <motion.h2 
          className="text-3xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isSuccess ? 'Check your email' : 'Reset Password'}
        </motion.h2>
        <motion.p 
          className="text-gray-600 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isSuccess 
            ? 'We have sent you instructions to reset your password'
            : 'Enter your email address to receive reset instructions'
          }
        </motion.p>
      </div>

      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-150" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-150 ease-in-out hover:border-primary-300"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-100"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Send Reset Instructions'
            )}
          </motion.button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2">
        <ArrowLeft className="w-4 h-4 text-gray-400" />
        <Link 
          to={isPublic ? "/login" : "/"}
          className="text-sm font-medium text-primary-500 hover:text-primary-600"
        >
          {isPublic ? 'Back to login' : 'Back to dashboard'}
        </Link>
      </div>
    </>
  )

  // Render different wrapper based on context
  return isPublic ? (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div 
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8"
          whileHover={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>

        <motion.p 
          className="mt-8 text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Protected by NN Solutions
        </motion.p>
      </motion.div>
    </div>
  ) : (
    <div className="container mx-auto p-6">
      <div className="max-w-md mx-auto">
        <motion.div 
          className="bg-white rounded-lg shadow-md p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}

