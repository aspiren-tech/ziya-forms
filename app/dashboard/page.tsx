'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Plus, FileText, Trash2, Edit, BarChart3, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Form, TemplateForm } from '@/lib/types/database';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [forms, setForms] = useState<Form[]>([]);
  const [templates, setTemplates] = useState<TemplateForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !session) {
      router.push('/auth/login');
      return;
    }

    if (session.user?.role === 'super_admin') {
      router.replace('/admin/dashboard');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.allSettled([fetchForms(), fetchTemplates()]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session, status, router]);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms');
      const data = await response.json();
      setForms(data.forms || []);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
      setForms([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
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
          template_id: templateId,
        }),
      });
      const data = await response.json();
      if (data.form) {
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

  const publishedFormsCount = forms.filter((form) => form.is_published).length;

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

  if (session.user?.role === 'super_admin') {
    router.replace('/admin/dashboard');
    return null;
  }

  console.log('Rendering dashboard with session:', session);

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary-light)] text-[color:var(--text-primary-light)] dark:bg-[color:var(--bg-primary)] dark:text-[color:var(--text-primary)]">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 overflow-hidden rounded-3xl border border-[color:var(--border-light)] bg-[color:var(--bg-surface-light)] shadow-sm dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-surface)]">
          <div
            className="h-1 w-full"
            style={{
              background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent), var(--accent-purple))',
            }}
          />
          <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--active-nav-light)] bg-[color:var(--active-nav-light)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--brand-primary-light)] dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-surface-hover)] dark:text-[color:var(--brand-accent)]">
                Workspace
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">
                Your Forms
              </h1>
              <p className="mt-3 text-lg text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)]">
                Create, edit, and manage forms from one clean workspace.
              </p>
            </div>

            <Button
              onClick={createNewForm}
              isLoading={isCreating}
              className="flex items-center gap-2 bg-[color:var(--brand-primary-light)] px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-xl hover:scale-105 dark:bg-[color:var(--brand-primary)]"
            >
              <Plus className="h-5 w-5" />
              New Form
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[color:var(--bg-surface-light)] p-4 shadow-sm ring-1 ring-[color:var(--border-light)] dark:bg-[color:var(--bg-surface-hover)] dark:ring-[color:var(--border-default)]">
              <p className="text-sm text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)]">Forms</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">{forms.length}</p>
            </div>
            <div className="rounded-2xl bg-[color:var(--bg-surface-light)] p-4 shadow-sm ring-1 ring-[color:var(--border-light)] dark:bg-[color:var(--bg-surface-hover)] dark:ring-[color:var(--border-default)]">
              <p className="text-sm text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)]">Templates</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">{templates.length}</p>
            </div>
            <div className="rounded-2xl bg-[color:var(--bg-surface-light)] p-4 shadow-sm ring-1 ring-[color:var(--border-light)] dark:bg-[color:var(--bg-surface-hover)] dark:ring-[color:var(--border-default)]">
              <p className="text-sm text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)]">Published</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">{publishedFormsCount}</p>
            </div>
          </div>
          </div>
        </div>

        {forms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-[color:var(--active-nav-light)] dark:bg-[color:var(--bg-surface-hover)] rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-[color:var(--brand-primary-light)] dark:text-[color:var(--brand-accent)]" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">
              No forms yet
            </h3>
            <p className="text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)] mb-8 max-w-md mx-auto">
              Create your first form to get started with collecting responses and analyzing data.
            </p>
            <Button
              onClick={createNewForm}
              isLoading={isCreating}
              className="bg-[color:var(--brand-primary-light)] hover:opacity-95 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 dark:bg-[color:var(--brand-primary)]"
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
                className="relative bg-[color:var(--bg-surface-light)] dark:bg-[color:var(--bg-surface)] border border-[color:var(--border-light)] dark:border-[color:var(--border-default)] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold line-clamp-1 text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">
                      {form.title}
                    </h3>
                    {form.is_published && (
                      <span className="px-3 py-1 text-xs rounded-full bg-[color:var(--status-success-light)] text-[color:var(--status-success-text-light)] dark:bg-[color:var(--status-success)] dark:text-white font-medium">
                        Published
                      </span>
                    )}
                  </div>
                  {form.description && (
                    <p className="text-sm text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)] line-clamp-2 mb-4">
                      {form.description}
                    </p>
                  )}
                  <p className="text-xs text-[color:var(--text-muted)] dark:text-[color:var(--text-muted)] mb-4">
                    Created {new Date(form.created_at).toLocaleDateString()}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/form/${form.id}/edit`}>
                      <Button variant="outline" size="sm" className="w-full border-[color:var(--border-light)] dark:border-[color:var(--border-default)] hover:bg-[color:var(--active-nav-light)]/60 dark:hover:bg-[color:var(--bg-surface-hover)] transition-colors">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/responses/${form.id}`}>
                      <Button variant="outline" size="sm" className="w-full border-[color:var(--border-light)] dark:border-[color:var(--border-default)] hover:bg-[color:var(--active-nav-light)]/60 dark:hover:bg-[color:var(--bg-surface-hover)] transition-colors">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Responses
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)] hover:bg-[color:var(--active-nav-light)]/60 dark:hover:bg-[color:var(--bg-surface-hover)] transition-colors"
                      onClick={() => copyFormLink(form.id)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                    <Link href={`/form/${form.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="w-full text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)] hover:bg-[color:var(--active-nav-light)]/60 dark:hover:bg-[color:var(--bg-surface-hover)] transition-colors">
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
            <h2 className="text-3xl font-bold mb-2 text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">
              Templates
            </h2>
            <p className="text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)]">
              Start with pre-built templates to save time
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} hover className="relative bg-[color:var(--bg-surface-light)] dark:bg-[color:var(--bg-surface)] border border-[color:var(--border-light)] dark:border-[color:var(--border-default)] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="w-12 h-12 bg-[color:var(--active-nav-light)] dark:bg-[color:var(--bg-surface-hover)] rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-[color:var(--icon-blue)] dark:text-[color:var(--brand-accent)]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">
                    {template.title}
                  </h3>
                  <p className="text-sm text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)] mb-4">
                    {template.description || 'Use this template to start quickly.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[color:var(--text-muted)] dark:text-[color:var(--text-muted)]">
                      {template.questions?.length || 0} questions
                    </p>
                    <Button
                      onClick={() => createFromTemplate(template.id)}
                      isLoading={isCreating}
                      size="sm"
                      className="bg-[color:var(--brand-primary-light)] hover:opacity-95 text-white dark:bg-[color:var(--brand-primary)]"
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
