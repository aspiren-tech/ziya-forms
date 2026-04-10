import { NextResponse } from 'next/server';
import { getPublicTemplates } from '@/lib/mysql/platform';

export async function GET() {
  try {
    const templates = await getPublicTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error in GET /api/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
