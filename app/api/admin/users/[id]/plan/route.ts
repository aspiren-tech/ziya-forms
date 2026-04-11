import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminUserById, updateAdminUser } from '@/lib/mysql/admin';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, segmentData: Params) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (currentUser.role !== 'super_admin') return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const { id } = await segmentData.params;
    const payload = await request.json();
    const plan = payload.billingPlan;

    if (plan !== 'free' && plan !== 'paid') {
      return NextResponse.json({ message: 'Invalid billing plan' }, { status: 400 });
    }

    if (id === currentUser.id) {
      return NextResponse.json({ message: 'You cannot change your own billing plan' }, { status: 400 });
    }

    const user = await getAdminUserById(id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const updated = await updateAdminUser(id, { billingPlan: plan });
    if (!updated) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const refreshed = await getAdminUserById(id);
    return NextResponse.json({ user: refreshed });
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]/plan:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
