'use client';

import { useEffect, useRef } from 'react';

type DraftPayload = {
  answers: Record<string, any>;
  respondentEmail: string;
  updatedAt: string;
};

export function useFormDraftAutosave({
  formId,
  editToken,
  disabled,
  submitSuccess,
  answers,
  respondentEmail,
  onRestore,
}: {
  formId: string;
  editToken: string | null;
  disabled: boolean;
  submitSuccess: boolean;
  answers: Record<string, any>;
  respondentEmail: string;
  onRestore: (draft: { answers: Record<string, any>; respondentEmail: string }) => void;
}) {
  const restoredRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const draftKey = `ziya-form-draft:${formId}:${editToken || 'new'}`;

  useEffect(() => {
    if (disabled || submitSuccess || restoredRef.current || editToken) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) {
        restoredRef.current = true;
        return;
      }

      const parsed = JSON.parse(raw) as DraftPayload;
      if (parsed && typeof parsed === 'object') {
        onRestore({
          answers: parsed.answers || {},
          respondentEmail: parsed.respondentEmail || '',
        });
      }
    } catch {
      // ignore malformed drafts
    } finally {
      restoredRef.current = true;
    }
  }, [disabled, submitSuccess, editToken, draftKey, onRestore]);

  useEffect(() => {
    if (disabled || submitSuccess) {
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      try {
        const payload: DraftPayload = {
          answers,
          respondentEmail,
          updatedAt: new Date().toISOString(),
        };
        window.localStorage.setItem(draftKey, JSON.stringify(payload));
      } catch {
        // ignore storage failures
      }
    }, 450);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [answers, respondentEmail, disabled, submitSuccess, draftKey]);

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // ignore storage failures
    }
  };

  return { clearDraft };
}
