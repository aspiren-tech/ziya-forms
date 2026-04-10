import { NextRequest, NextResponse } from 'next/server';
import { getFormWithQuestions, getResponsesWithAnswers } from '@/lib/mysql/utils';
import { normalizeFormSettings } from '@/lib/form-settings';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, segmentData: Params) {
  try {
    const { id } = await segmentData.params;
    const form = await getFormWithQuestions(id);

    if (!form || !form.is_published) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const settings = normalizeFormSettings(form.settings);
    if (!settings.show_results_summary) {
      return NextResponse.json({ error: 'Results summary is not enabled' }, { status: 403 });
    }

    const responses = await getResponsesWithAnswers(id);
    return NextResponse.json({ form, responses });
  } catch (error) {
    console.error('Error in GET /api/forms/[id]/summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
