import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminUserById, resetAdminUserPassword } from '@/lib/mysql/admin';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, segmentData: Params) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { id } = await segmentData.params;
    const user = await getAdminUserById(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const result = await resetAdminUserPassword(id);

    if (!result) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Password reset successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/reset-password:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
