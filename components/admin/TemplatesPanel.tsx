'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { TemplateForm } from '@/lib/types/database';
import { Plus, PencilLine, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const emptyForm = {
  title: '',
  description: '',
  category: '',
  questions: '[]',
};

export function TemplatesPanel() {
  const [templates, setTemplates] = useState<TemplateForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/templates');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load templates');
      }
      setTemplates(data.templates || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTemplates();
  }, []);

  const parsedQuestions = useMemo(() => {
    try {
      return JSON.parse(form.questions || '[]');
    } catch {
      return null;
    }
  }, [form.questions]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setNotice('');
  };

  const startEdit = (template: TemplateForm) => {
    setEditingId(template.id);
    setForm({
      title: template.title,
      description: template.description || '',
      category: template.category || '',
      questions: JSON.stringify(template.questions || [], null, 2),
    });
  };

  const saveTemplate = async () => {
    let questions: any[] = [];
    try {
      questions = JSON.parse(form.questions || '[]');
      if (!Array.isArray(questions)) {
        throw new Error('Questions must be a JSON array');
      }
    } catch (err) {
      setError((err as Error).message || 'Invalid questions JSON');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch(editingId ? `/api/admin/templates/${editingId}` : '/api/admin/templates', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          questions,
          is_active: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save template');
      }

      setNotice(editingId ? 'Template updated.' : 'Template created and visible to users.');
      setEditingId(null);
      setForm(emptyForm);
      await fetchTemplates();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleTemplate = async (template: TemplateForm) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !template.is_active }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update template');
      }
      setNotice(template.is_active ? 'Template hidden from users.' : 'Template published to users.');
      await fetchTemplates();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (template: TemplateForm) => {
    if (!confirm(`Delete template "${template.title}"?`)) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/templates/${template.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete template');
      }
      setNotice('Template deleted.');
      await fetchTemplates();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border border-white/60 bg-white/75 shadow-[0_15px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Templates</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Create reusable starter forms</h2>
          </div>
          <Button onClick={startCreate} className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        {notice && <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">{notice}</div>}
        {error && <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>}

        {loading ? (
          <div className="py-10 text-sm text-slate-500">Loading templates...</div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{template.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{template.description || 'No description yet'}</p>
                    <p className="mt-2 text-xs text-slate-500">{template.questions.length} questions · {template.is_active ? 'Visible' : 'Hidden'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(template)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button onClick={() => toggleTemplate(template)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      {template.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    <button onClick={() => deleteTemplate(template)} className="rounded-xl border border-slate-200 p-2 text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {templates.length === 0 && <div className="py-10 text-sm text-slate-500">No templates yet.</div>}
          </div>
        )}
      </Card>

      <Card className="border border-white/60 bg-white/75 shadow-[0_15px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{editingId ? 'Edit Template' : 'Template Builder'}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{editingId ? 'Update template' : 'Create a new template'}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Templates you save here will appear in every users dashboard.</p>
        </div>

        <div className="space-y-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</span>
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
            <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="min-h-24 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</span>
            <input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Questions JSON</span>
            <textarea
              value={form.questions}
              onChange={(e) => setForm((prev) => ({ ...prev, questions: e.target.value }))}
              className="min-h-64 rounded-xl border border-slate-200 bg-white px-4 py-2 font-mono text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </label>

          <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Preview</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{parsedQuestions ? JSON.stringify(parsedQuestions, null, 2) : 'Invalid JSON'}</pre>
          </div>

          <div className="flex gap-3">
            <Button onClick={saveTemplate} isLoading={saving} className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
              Save Template
            </Button>
            {editingId && <Button variant="outline" onClick={startCreate}>Clear</Button>}
          </div>
        </div>
      </Card>
    </div>
  );
}
