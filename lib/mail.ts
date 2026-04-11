import nodemailer from 'nodemailer';
import { getSmtpSettings, getSuperAdminEmail } from '@/lib/mysql/platform';
import type { FormWithQuestions, ResponseWithAnswers } from '@/lib/types/database';

function formatAnswerValue(answer: ResponseWithAnswers['answers'][number]) {
  const answerText = answer.answer_text as unknown;

  if (answerText) {
    if (typeof answerText === 'string') {
      try {
        const parsed = JSON.parse(answerText);
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
      } catch {
        // ignore JSON parse errors and fall through to raw text
      }
      return answerText;
    }

    if (Array.isArray(answerText)) {
      return answerText.join(', ');
    }

    return String(answerText);
  }

  if (answer.answer_data && typeof answer.answer_data === 'object') {
    return Object.values(answer.answer_data).filter(Boolean).join(', ');
  }

  return '';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildResponseRows(params: {
  form: FormWithQuestions;
  response: ResponseWithAnswers;
}) {
  return params.form.questions.map((question) => {
    const answer = params.response.answers.find((item) => item.question_id === question.id);
    const value = formatAnswerValue(answer as any) || 'No answer';
    return `<tr>
      <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;vertical-align:top;">${escapeHtml(question.title)}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(value)}</td>
    </tr>`;
  }).join('');
}

export async function sendResponseCopyEmail(params: {
  form: FormWithQuestions;
  respondentEmail: string;
  response: ResponseWithAnswers;
}) {
  const smtpSettings = await getSmtpSettings();
  if (!smtpSettings) {
    return { sent: false, reason: 'smtp_not_configured' as const };
  }

  const transporter = nodemailer.createTransport({
    host: smtpSettings.host,
    port: smtpSettings.port,
    secure: smtpSettings.secure,
    auth: {
      user: smtpSettings.user,
      pass: smtpSettings.password,
    },
  });

  const lines = [
    `Thank you for submitting "${params.form.title}".`,
    '',
    'Here is a copy of your response:',
    '',
    ...params.form.questions.map((question) => {
      const answer = params.response.answers.find((item) => item.question_id === question.id);
      return `${question.title}: ${formatAnswerValue(answer as any) || 'No answer'}`;
    }),
  ];

  await transporter.sendMail({
    from: `${smtpSettings.from_name} <${smtpSettings.from_email}>`,
    to: params.respondentEmail,
    subject: `Copy of your response: ${params.form.title}`,
    text: lines.join('\n'),
  });

  return { sent: true as const };
}

export async function sendAdminResponseNotificationEmail(params: {
  form: FormWithQuestions;
  response: ResponseWithAnswers;
  updatedExisting?: boolean;
}) {
  const smtpSettings = await getSmtpSettings();
  const recipientEmail = await getSuperAdminEmail();

  if (!smtpSettings || !recipientEmail) {
    return { sent: false, reason: 'notification_unavailable' as const };
  }

  const transporter = nodemailer.createTransport({
    host: smtpSettings.host,
    port: smtpSettings.port,
    secure: smtpSettings.secure,
    auth: {
      user: smtpSettings.user,
      pass: smtpSettings.password,
    },
  });

  const submittedAt = new Date(params.response.submitted_at).toLocaleString();
  const source = params.response.submission_source || 'direct';
  const email = params.response.respondent_email || 'Not collected';

  const subject = `${params.updatedExisting ? 'Updated response' : 'New response received'}: ${params.form.title}`;
  const textLines = [
    `${params.updatedExisting ? 'An existing response was updated' : 'A new response was received'} for "${params.form.title}".`,
    '',
    `Submitted at: ${submittedAt}`,
    `Source: ${source}`,
    `Respondent email: ${email}`,
    '',
    'Answers:',
    ...params.form.questions.map((question) => {
      const answer = params.response.answers.find((item) => item.question_id === question.id);
      return `- ${question.title}: ${formatAnswerValue(answer as any) || 'No answer'}`;
    }),
  ];

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
      <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
        <div style="padding: 24px; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: #fff;">
          <h1 style="margin: 0; font-size: 24px;">${escapeHtml(params.updatedExisting ? 'Updated response' : 'New response received')}</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">${escapeHtml(params.form.title)}</p>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 12px;"><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</p>
          <p style="margin: 0 0 12px;"><strong>Source:</strong> ${escapeHtml(source)}</p>
          <p style="margin: 0 0 20px;"><strong>Respondent email:</strong> ${escapeHtml(email)}</p>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <tbody>
              ${buildResponseRows({ form: params.form, response: params.response })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `${smtpSettings.from_name} <${smtpSettings.from_email}>`,
    to: recipientEmail,
    subject,
    text: textLines.join('\n'),
    html,
  });

  return { sent: true as const };
}
