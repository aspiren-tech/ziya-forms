'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { QuestionType, TemplateForm } from '@/lib/types/database';
import {
  AlignLeft,
  CheckSquare,
  ChevronDown,
  Copy,
  GripVertical,
  ListChecks,
  MoveDown,
  MoveUp,
  PencilLine,
  Plus,
  Radio,
  Square,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Type,
  Upload,
} from 'lucide-react';

type TemplateQuestion = {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  is_required: boolean;
  options: string[];
  settings: Record<string, any>;
};

type TemplateFormState = {
  title: string;
  description: string;
  category: string;
  questions: TemplateQuestion[];
};

const emptyForm: TemplateFormState = { title: '', description: '', category: '', questions: [] };

const questionTypes: Array<{ value: QuestionType; label: string; icon: ReactNode }> = [
  { value: 'short_answer', label: 'Short answer', icon: <Type className="h-4 w-4" /> },
  { value: 'paragraph', label: 'Paragraph', icon: <AlignLeft className="h-4 w-4" /> },
  { value: 'multiple_choice', label: 'Multiple choice', icon: <Radio className="h-4 w-4" /> },
  { value: 'checkboxes', label: 'Checkboxes', icon: <CheckSquare className="h-4 w-4" /> },
  { value: 'dropdown', label: 'Dropdown', icon: <ChevronDown className="h-4 w-4" /> },
  { value: 'linear_scale', label: 'Linear scale', icon: <ListChecks className="h-4 w-4" /> },
  { value: 'file_upload', label: 'File upload', icon: <Upload className="h-4 w-4" /> },
];

const isChoice = (type: QuestionType) => type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown';

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createQuestion(type: QuestionType = 'short_answer'): TemplateQuestion {
  return {
    id: createId(),
    title: '',
    description: '',
    type,
    is_required: false,
    options: isChoice(type) ? ['Option 1', 'Option 2'] : [],
    settings: type === 'linear_scale' ? { min: 1, max: 5 } : {},
  };
}

function normalizeQuestion(raw: Record<string, any>, index: number): TemplateQuestion {
  const type = (raw.type as QuestionType) || 'short_answer';
  const options = Array.isArray(raw.options)
    ? raw.options.map((option) => (typeof option === 'string' ? option : String(option?.label || option?.value || ''))).filter(Boolean)
    : [];
  return {
    id: String(raw.id || `q-${index}-${Date.now()}`),
    title: String(raw.title || raw.question || ''),
    description: String(raw.description || ''),
    type,
    is_required: Boolean(raw.is_required),
    options: isChoice(type) ? (options.length ? options : ['Option 1', 'Option 2']) : [],
    settings: { ...(raw.settings || {}), ...(type === 'linear_scale' ? { min: raw.settings?.min ?? 1, max: raw.settings?.max ?? 5 } : {}) },
  };
}

function normalizeQuestions(questions: Array<Record<string, any>> | undefined | null) {
  return Array.isArray(questions) ? questions.map((q, i) => normalizeQuestion(q || {}, i)) : [];
}

function PreviewCard({ question }: { question: TemplateQuestion }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              {questionTypes.find((item) => item.value === question.type)?.icon}
            </span>
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{question.title || 'Untitled question'}</p>
          </div>
          {question.description ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{question.description}</p> : null}
        </div>
        {question.is_required ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">Required</span> : null}
      </div>
      <div className="mt-4">
        {question.type === 'short_answer' ? <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">Short answer text</div> : null}
        {question.type === 'paragraph' ? <div className="min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900" /> : null}
        {question.type === 'file_upload' ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">Upload a file</div> : null}
        {question.type === 'dropdown' ? <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"><span>Select an option</span><ChevronDown className="h-4 w-4" /></div> : null}
        {question.type === 'multiple_choice' || question.type === 'checkboxes' ? <div className="space-y-2">{question.options.map((opt, idx) => <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{question.type === 'multiple_choice' ? <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-500" /> : <Square className="h-4 w-4" />}<span>{opt}</span></div>)}</div> : null}
        {question.type === 'linear_scale' ? <div className="space-y-3"><div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"><span>{question.settings.min ?? 1}</span><span>{question.settings.max ?? 5}</span></div><div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" /></div></div> : null}
      </div>
    </div>
  );
}

export function TemplatesPanel() {
  const [templates, setTemplates] = useState<TemplateForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateFormState>(emptyForm);

  const selectedQuestion = useMemo(() => form.questions.find((question) => question.id === selectedQuestionId) || form.questions[0] || null, [form.questions, selectedQuestionId]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/templates');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load templates');
      setTemplates(data.templates || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchTemplates(); }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedQuestionId(null);
    setNotice('');
    setError('');
  };

  const startEdit = (template: TemplateForm) => {
    const questions = normalizeQuestions(template.questions);
    setEditingId(template.id);
    setForm({ title: template.title, description: template.description || '', category: template.category || '', questions });
    setSelectedQuestionId(questions[0]?.id || null);
    setNotice('');
    setError('');
  };

  const updateQuestion = (id: string, patch: Partial<TemplateQuestion>) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...patch, settings: { ...q.settings, ...(patch.settings || {}) } } : q)),
    }));

  const addQuestion = (type: QuestionType = 'short_answer') => {
    const next = createQuestion(type);
    setForm((prev) => ({ ...prev, questions: [...prev.questions, next] }));
    setSelectedQuestionId(next.id);
  };

  const duplicateQuestion = (id: string) =>
    setForm((prev) => {
      const source = prev.questions.find((q) => q.id === id);
      if (!source) return prev;
      const clone = { ...source, id: createId(), title: source.title ? `${source.title} Copy` : 'Untitled question copy', options: [...source.options], settings: { ...source.settings } };
      const next = [...prev.questions];
      next.splice(next.findIndex((q) => q.id === id) + 1, 0, clone);
      setSelectedQuestionId(clone.id);
      return { ...prev, questions: next };
    });

  const moveQuestion = (id: string, direction: -1 | 1) =>
    setForm((prev) => {
      const index = prev.questions.findIndex((q) => q.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= prev.questions.length) return prev;
      const next = [...prev.questions];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return { ...prev, questions: next };
    });

  const removeQuestion = (id: string) => {
    setForm((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== id) }));
    setSelectedQuestionId((curr) => (curr === id ? null : curr));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        const options = [...q.options];
        options[optionIndex] = value;
        return { ...q, options };
      }),
    }));

  const addOption = (questionId: string) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q)),
    }));

  const removeOption = (questionId: string, optionIndex: number) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        const options = q.options.filter((_, index) => index !== optionIndex);
        return { ...q, options: options.length ? options : ['Option 1'] };
      }),
    }));

  const saveTemplate = async () => {
    if (!form.title.trim()) return setError('Template title is required.');
    setSaving(true);
    setError('');
    try {
      const response = await fetch(editingId ? `/api/admin/templates/${editingId}` : '/api/admin/templates', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, description: form.description, category: form.category, questions: form.questions, is_active: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save template');
      setNotice(editingId ? 'Template updated.' : 'Template created and visible to users.');
      startCreate();
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
      if (!response.ok) throw new Error(data.message || 'Failed to update template');
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
      if (!response.ok) throw new Error(data.message || 'Failed to delete template');
      setNotice('Template deleted.');
      await fetchTemplates();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="border border-white/60 bg-white/75 shadow-[0_15px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Templates</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Create reusable starter forms</h2>
          </div>
          <Button onClick={startCreate} className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white"><Plus className="mr-2 h-4 w-4" />New Template</Button>
        </div>
        {notice ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">{notice}</div> : null}
        {error ? <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">{error}</div> : null}
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
                    <button onClick={() => startEdit(template)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><PencilLine className="h-4 w-4" /></button>
                    <button onClick={() => toggleTemplate(template)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">{template.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button>
                    <button onClick={() => deleteTemplate(template)} className="rounded-xl border border-slate-200 p-2 text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            {templates.length === 0 ? <div className="py-10 text-sm text-slate-500">No templates yet.</div> : null}
          </div>
        )}
      </Card>

      <Card className="border border-white/60 bg-white/75 shadow-[0_15px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{editingId ? 'Edit Template' : 'Template Builder'}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{editingId ? 'Update template' : 'Create a new template'}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Build visually, save JSON behind the scenes.</p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Template title</span>
              <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" placeholder="Customer feedback form" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</span>
              <input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" placeholder="Feedback" />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
            <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="min-h-24 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" placeholder="Give respondents a short introduction to the form." />
          </label>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Question canvas</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add, reorder, duplicate, and shape each question visually.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {questionTypes.slice(0, 3).map((option) => (
                  <button key={option.value} type="button" onClick={() => addQuestion(option.value)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {form.questions.map((question, index) => {
                const label = questionTypes.find((option) => option.value === question.type)?.label;
                const active = selectedQuestion?.id === question.id;
                return (
                  <div key={question.id} onClick={() => setSelectedQuestionId(question.id)} className={`rounded-3xl border p-4 transition ${active ? 'border-blue-400 bg-white shadow-[0_12px_30px_rgba(37,99,235,0.12)] dark:border-blue-500/60 dark:bg-slate-950' : 'border-slate-200 bg-white/90 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60'}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex flex-col items-center gap-2 text-slate-400"><GripVertical className="h-4 w-4" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em]">{index + 1}</span></div>
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-900 dark:text-slate-300">{questionTypes.find((option) => option.value === question.type)?.icon}{label}</span>
                            {question.is_required ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">Required</span> : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={(event) => { event.stopPropagation(); moveQuestion(question.id, -1); }} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"><MoveUp className="h-4 w-4" /></button>
                            <button type="button" onClick={(event) => { event.stopPropagation(); moveQuestion(question.id, 1); }} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"><MoveDown className="h-4 w-4" /></button>
                            <button type="button" onClick={(event) => { event.stopPropagation(); duplicateQuestion(question.id); }} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"><Copy className="h-4 w-4" /></button>
                            <button type="button" onClick={(event) => { event.stopPropagation(); removeQuestion(question.id); }} className="rounded-xl border border-slate-200 p-2 text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Question title</span><input value={question.title} onChange={(e) => updateQuestion(question.id, { title: e.target.value })} onClick={(e) => e.stopPropagation()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" placeholder="What would you like to ask?" /></label>
                          <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Question type</span><select value={question.type} onChange={(e) => updateQuestion(question.id, { type: e.target.value as QuestionType, options: isChoice(e.target.value as QuestionType) ? (question.options.length ? question.options : ['Option 1', 'Option 2']) : [], settings: e.target.value === 'linear_scale' ? { ...question.settings, min: question.settings.min ?? 1, max: question.settings.max ?? 5 } : question.settings })} onClick={(e) => e.stopPropagation()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white">{questionTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                        </div>

                        <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Description</span><textarea value={question.description} onChange={(e) => updateQuestion(question.id, { description: e.target.value })} onClick={(e) => e.stopPropagation()} className="min-h-20 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" placeholder="Optional helper text shown below the question." /></label>

                        <div className="flex flex-wrap items-center gap-4">
                          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"><input type="checkbox" checked={question.is_required} onChange={(e) => updateQuestion(question.id, { is_required: e.target.checked })} onClick={(e) => e.stopPropagation()} className="rounded" />Required</label>
                          {question.type === 'linear_scale' ? <>
                            <label className="grid gap-1"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Min</span><input type="number" value={question.settings.min ?? 1} onChange={(e) => updateQuestion(question.id, { settings: { ...question.settings, min: Number(e.target.value) || 1 } })} onClick={(e) => e.stopPropagation()} className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" /></label>
                            <label className="grid gap-1"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Max</span><input type="number" value={question.settings.max ?? 5} onChange={(e) => updateQuestion(question.id, { settings: { ...question.settings, max: Number(e.target.value) || 5 } })} onClick={(e) => e.stopPropagation()} className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" /></label>
                          </> : null}
                        </div>

                        {isChoice(question.type) ? (
                          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="flex items-center justify-between gap-3">
                              <div><p className="text-sm font-semibold text-slate-900 dark:text-white">Options</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">These options will be shown to respondents.</p></div>
                              <Button type="button" variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); addOption(question.id); }}><Plus className="mr-1 h-4 w-4" />Add Option</Button>
                            </div>
                            <div className="space-y-2">{question.options.map((option, optionIndex) => <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2"><span className="w-7 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">{optionIndex + 1}</span><input value={option} onChange={(e) => updateOption(question.id, optionIndex, e.target.value)} onClick={(e) => e.stopPropagation()} className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" placeholder={`Option ${optionIndex + 1}`} /><button type="button" onClick={(event) => { event.stopPropagation(); removeOption(question.id, optionIndex); }} className="rounded-xl border border-slate-200 p-2 text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button></div>)}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              {form.questions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-950/40">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">No questions yet</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start by adding a question type above.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">{questionTypes.map((option) => <Button key={option.value} type="button" variant="outline" size="sm" onClick={() => addQuestion(option.value)}><span className="mr-2">{option.icon}</span>{option.label}</Button>)}</div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Live preview</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This mirrors how respondents will experience the template.</p>
              <div className="mt-4 space-y-3">{form.questions.length > 0 ? form.questions.map((question) => <PreviewCard key={question.id} question={question} />) : <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Add a question to see the live preview.</div>}</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Quick stats</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950/70"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Questions</p><p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{form.questions.length}</p></div>
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950/70"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Required</p><p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{form.questions.filter((q) => q.is_required).length}</p></div>
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950/70"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Selected</p><p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{selectedQuestion ? selectedQuestion.title || 'Untitled' : 'None'}</p></div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={saveTemplate} isLoading={saving} className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white">Save Template</Button>
            {editingId ? <Button variant="outline" onClick={startCreate}>Clear</Button> : null}
            <Button variant="outline" onClick={() => addQuestion('short_answer')}><Plus className="mr-2 h-4 w-4" />Add Question</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
