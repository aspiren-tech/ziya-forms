import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createTemplate, getAllTemplates } from '@/lib/mysql/platform';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'super_admin') return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const templates = await getAllTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error in GET /api/admin/templates:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'super_admin') return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const body = await request.json();
    const template = await createTemplate({
      title: body.title,
      description: body.description,
      category: body.category,
      questions: Array.isArray(body.questions) ? body.questions : [],
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/templates:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
