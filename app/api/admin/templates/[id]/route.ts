import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteTemplate, getTemplateById, updateTemplate } from '@/lib/mysql/platform';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, segmentData: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'super_admin') return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const { id } = await segmentData.params;
    const payload = await request.json();
    const updated = await updateTemplate(id, {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      questions: Array.isArray(payload.questions) ? payload.questions : undefined,
      is_active: typeof payload.is_active === 'boolean' ? payload.is_active : undefined,
    });

    if (!updated) {
      return NextResponse.json({ message: 'No changes applied' }, { status: 400 });
    }

    const template = await getTemplateById(id);
    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in PUT /api/admin/templates/[id]:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, segmentData: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'super_admin') return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const { id } = await segmentData.params;
    const deleted = await deleteTemplate(id);

    if (!deleted) {
      return NextResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/templates/[id]:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
