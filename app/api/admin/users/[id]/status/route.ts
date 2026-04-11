import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminUserById, updateAdminUserStatus } from '@/lib/mysql/admin';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, segmentData: Params) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { id } = await segmentData.params;
    const payload = await request.json();
    const nextStatus = payload.status;

    if (nextStatus !== 'active' && nextStatus !== 'inactive') {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    if (id === currentUser.id && nextStatus === 'inactive') {
      return NextResponse.json({ message: 'You cannot deactivate your own account' }, { status: 400 });
    }

    const user = await getAdminUserById(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updated = await updateAdminUserStatus(id, nextStatus);

    if (!updated) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const refreshedUser = await getAdminUserById(id);
    return NextResponse.json({ user: refreshedUser });
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]/status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
