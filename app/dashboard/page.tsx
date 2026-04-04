'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { motion } from 'framer-motion';
import { Plus, FileText, Trash2, Edit, BarChart3, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Form } from '@/lib/types/database';
import { APP_NAME } from '@/lib/config';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Sample template form
  const templateForms = [
    {
      id: 'template-1',
      title: 'Contact Information Form',
      description: 'Collect basic contact information from your users',
      questions: 3,
    }
  ];

  useEffect(() => {
    console.log('Dashboard useEffect triggered', { status, session });
    
    if (status === 'loading') {
      console.log('Session is loading...');
      return;
    }
    
    if (status === 'unauthenticated') {
      console.log('User is unauthenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }
    
    if (!session) {
      console.log('No session found, redirecting to login');
      router.push('/auth/login');
      return;
    }
    
    console.log('Session found, fetching forms');
    // Small delay to ensure session is fully established
    const timer = setTimeout(() => {
      fetchForms();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [session, status, router]);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms');
      const data = await response.json();
      setForms(data.forms || []);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
      setForms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewForm = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Form',
          description: '',
        }),
      });
      const data = await response.json();
      if (data.form) {
        router.push(`/form/${data.form.id}/edit`);
      }
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Failed to create form');
    } finally {
      setIsCreating(false);
    }
  };

  const createFromTemplate = async (templateId: string) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Contact Information Form',
          description: 'Collect basic contact information from your users',
        }),
      });
      const data = await response.json();
      if (data.form) {
        // In a real implementation, we would copy the template structure
        router.push(`/form/${data.form.id}/edit`);
      }
    } catch (error) {
      console.error('Failed to create form from template:', error);
      alert('Failed to create form from template');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setForms(forms.filter(f => f.id !== formId));
      } else {
        throw new Error('Failed to delete form');
      }
    } catch (error) {
      console.error('Failed to delete form:', error);
      alert('Failed to delete form');
    }
  };

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    // Show a toast notification instead of alert in a real implementation
    alert('Form link copied to clipboard!');
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    console.log('Rendering login redirect because unauthenticated');
    router.push('/auth/login');
    return null;
  }

  if (!session) {
    console.log('Rendering null because no session');
    router.push('/auth/login');
    return null;
  }

  console.log('Rendering dashboard with session:', session);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Your Forms
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Create, edit, and manage your forms
            </p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Publish your forms to make them publicly accessible via the "View" button
              </p>
            </div>
          </div>
          <Button
            onClick={createNewForm}
            isLoading={isCreating}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            New Form
          </Button>
        </div>

        {forms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
              No forms yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Create your first form to get started with collecting responses and analyzing data.
            </p>
            <Button
              onClick={createNewForm}
              isLoading={isCreating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Form
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form, index) => (
              <Card
                key={form.id}
                hover
                className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold line-clamp-1 text-slate-900 dark:text-white">
                      {form.title}
                    </h3>
                    {form.is_published && (
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium">
                        Published
                      </span>
                    )}
                  </div>
                  {form.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {form.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                    Created {new Date(form.created_at).toLocaleDateString()}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/form/${form.id}/edit`}>
                      <Button variant="outline" size="sm" className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/responses/${form.id}`}>
                      <Button variant="outline" size="sm" className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Responses
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => copyFormLink(form.id)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                    <Link href={`/form/${form.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="w-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={() => deleteForm(form.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Template Section */}
        <div className="mt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Templates
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Start with pre-built templates to save time
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templateForms.map((template) => (
              <Card key={template.id} hover className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">
                    {template.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {template.questions} questions
                    </p>
                    <Button
                      onClick={() => createFromTemplate(template.id)}
                      isLoading={isCreating}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}