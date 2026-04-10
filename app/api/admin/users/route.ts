import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminUsers } from '@/lib/mysql/admin';

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'super_admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), 10), 100);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const result = await getAdminUsers({
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
