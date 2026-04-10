import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql/connection';
import { getFormById, getResponseByEditToken } from '@/lib/mysql/utils';
import { normalizeFormSettings } from '@/lib/form-settings';

type Params = { params: Promise<{ id: string; token: string }> };

export async function GET(request: NextRequest, segmentData: Params) {
  try {
    const { id: formId, token } = await segmentData.params;
    const form = await getFormById(formId);

    if (!form || !form.is_published) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const settings = normalizeFormSettings(form.settings);
    if (!settings.allow_response_editing) {
      return NextResponse.json({ error: 'Editing is not enabled for this form' }, { status: 403 });
    }

    const response = await getResponseByEditToken(formId, token);

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    const connection = await pool.getConnection();
    try {
      const [rows]: any = await connection.execute(
        `SELECT * FROM answers WHERE response_id = ? ORDER BY created_at ASC`,
        [response.id]
      );

      return NextResponse.json({
        response: {
          ...response,
          answers: rows.map((row: any) => ({
            ...row,
            answer_data: typeof row.answer_data === 'string' ? JSON.parse(row.answer_data) : row.answer_data,
          })),
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in GET /api/forms/[id]/response/[token]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
