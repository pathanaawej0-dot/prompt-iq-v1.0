'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="text-center">
            <Card.Content className="p-8">
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
              >
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 mb-6">
                  We encountered an unexpected error. Don't worry, our team has been notified 
                  and we're working to fix it.
                </p>

                {/* Error Details (in development) */}
                {process.env.NODE_ENV === 'development' && error?.message && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Error Details (Development Only):
                    </h3>
                    <code className="text-xs text-red-600 break-all">
                      {error.message}
                    </code>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={reset}
                    variant="gradient"
                    size="lg"
                    className="group"
                  >
                    <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    size="lg"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                  </Button>
                </div>
              </motion.div>

              {/* Support Contact */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <p className="text-sm text-gray-500 mb-3">
                  Still having trouble? We're here to help.
                </p>
                <Button
                  onClick={() => window.location.href = 'mailto:support@promptiq.com?subject=Error Report'}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-500"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </motion.div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
