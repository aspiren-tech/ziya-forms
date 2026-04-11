import { NextRequest, NextResponse } from 'next/server';
import { getFormWithQuestions } from '@/lib/mysql/utils';
import { saveFormSubmission } from '@/lib/forms/submission';

type Params = { params: Promise<{ id: string }> };

// POST submit a response to a form (simplified structure)
export async function POST(request: NextRequest, segmentData: Params) {
  try {
    const { id: formId } = await segmentData.params;
    const body = await request.json();
    const { response_data } = body;
    
    // Verify the form exists and is accepting responses
    const form = await getFormWithQuestions(formId);
    
    if (!form || !form.is_published || !form.is_accepting_responses) {
      return NextResponse.json({ error: 'Form not found or not accepting responses' }, { status: 404 });
    }
    
    const result = await saveFormSubmission(form, {
      respondent_email: response_data?.respondent_email || null,
      submission_source: response_data?.submission_source || 'direct',
      answers: response_data?.answers || [],
      edit_token: response_data?.edit_token || null,
    });
    
    return NextResponse.json({ 
      message: 'Response submitted successfully!',
      response_id: result.response_id,
      edit_token: result.edit_token,
      updated_existing: result.updated_existing,
    });
  } catch (error) {
    console.error('Error in POST /api/forms/[id]/submit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
