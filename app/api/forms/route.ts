import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_FORM_THEME_COLOR } from '@/lib/config';
import { DEFAULT_FORM_SETTINGS } from '@/lib/form-settings';
import { getCurrentUser } from '@/lib/auth';
import { createForm, getFormsByUserId, createQuestion } from '@/lib/mysql/utils';
import { getTemplateById } from '@/lib/mysql/platform';
import { nanoid } from 'nanoid';

// GET all forms for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the current user from NextAuth session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch forms for the current user from MySQL
    const forms = await getFormsByUserId(user.id);
    
    return NextResponse.json({ forms });
  } catch (error) {
    console.error('Error in GET /api/forms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new form
export async function POST(request: NextRequest) {
  try {
    // Get the current user from NextAuth session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, description, theme_color, template_id } = body;

    let template = null;
    if (template_id) {
      template = await getTemplateById(template_id);
    }

    // Create a new form in MySQL
    const formData: any = {
      id: nanoid(),
      user_id: user.id,
      title: title || template?.title || 'Untitled Form',
      description: description || template?.description || '',
      theme_color: theme_color || DEFAULT_FORM_THEME_COLOR,
      banner_url: null,
      settings: DEFAULT_FORM_SETTINGS,
      is_published: false,
      is_accepting_responses: true,
    };

    // Try to insert the form data
    const form = await createForm(formData);
    
    if (template?.questions?.length) {
      await createTemplateQuestions(form.id, template.questions as any[], formData.settings.default_question_required);
    } else {
      // Create default questions for the new form
      await createDefaultQuestions(form.id, formData.settings.default_question_required);
    }
    
    return NextResponse.json({ form }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/forms:', error);
    return NextResponse.json({ error: 'Internal server error: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}

async function createDefaultQuestions(formId: string, requiredByDefault = false) {
  const defaultQuestions = [
    {
      id: nanoid(),
      form_id: formId,
      title: 'What is your name?',
      type: 'short_answer',
      options: [],
      is_required: requiredByDefault,
      order_index: 0,
      settings: {},
    },
    {
      id: nanoid(),
      form_id: formId,
      title: 'What is your email?',
      type: 'short_answer',
      options: [],
      is_required: requiredByDefault,
      order_index: 1,
      settings: {},
    }
  ];
  
  // Create each question
  for (const question of defaultQuestions) {
    try {
      await createQuestion(question);
    } catch (error) {
      console.error('Error creating default question:', error);
    }
  }
}

async function createTemplateQuestions(formId: string, templateQuestions: any[], requiredByDefault = false) {
  for (const [index, question] of templateQuestions.entries()) {
    try {
      await createQuestion({
        id: nanoid(),
        form_id: formId,
        title: question.title || `Question ${index + 1}`,
        description: question.description || '',
        type: question.type || 'short_answer',
        options: Array.isArray(question.options) ? question.options : [],
        is_required: question.is_required !== undefined ? question.is_required : requiredByDefault,
        order_index: question.order_index !== undefined ? question.order_index : index,
        settings: question.settings || {},
      });
    } catch (error) {
      console.error('Error creating template question:', error);
    }
  }
}
