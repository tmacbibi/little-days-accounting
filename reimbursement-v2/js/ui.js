import { money } from './rules.js';

export const html = String.raw;
export const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

export function statusPill(status) {
  const cls = { '草稿':'draft','待請款':'pending','已產生表單':'generated','已請款':'paid' }[status] || 'draft';
  return `<span class="pill ${cls}">${esc(status)}</span>`;
}

export function eventCard(e) {
  return html`<article class="event-card" data-id="${esc(e.id)}">
    <div class="event-card-top"><div><strong>${esc(e.name || '未命名事件')}</strong><div class="muted">${esc(e.date)} ・ ${esc(e.projectCode || '未選專案')}</div></div>${statusPill(e.status)}</div>
    <div class="event-card-bottom"><span>${esc(e.eventType)}</span><strong>${money(e.computed?.claimTotal || 0)}</strong></div>
  </article>`;
}

export function emptyState(title, body) {
  return `<div class="empty"><div class="empty-icon">✓</div><strong>${esc(title)}</strong><p>${esc(body)}</p></div>`;
}