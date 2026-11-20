import { PRESET_CATEGORIES, PRESET_GROUPS, PRESET_COUNT, presetSearchText } from './presets.js';
import { esc } from '../ui.js';

export function presetPickerMarkup() {
  return `
    <div class="preset-picker" data-preset-picker>
      <div class="preset-toolbar">
        <input type="search" data-preset-search placeholder="Search a category — t-shirt, jeans, watch, sunglasses…" aria-label="Search size chart categories" autocomplete="off" />
      </div>
      <div class="chip-row" data-preset-chips role="group" aria-label="Filter categories">
        <button type="button" class="chip is-active" data-preset-category="all" data-preset-count="${PRESET_COUNT}">All <span class="chip-count">${PRESET_COUNT}</span></button>
        ${PRESET_CATEGORIES.map((category) => {
          const count = PRESET_GROUPS.find((group) => group.key === category.key)?.presets.length ?? 0;
          return `<button type="button" class="chip" data-preset-category="${category.key}" data-preset-count="${count}">${esc(category.label)} <span class="chip-count">${count}</span></button>`;
        }).join('')}
      </div>
      <div class="preset-groups">
        ${PRESET_GROUPS.map((group) => `
          <div class="preset-group" data-preset-group="${group.key}">
            <h3 class="preset-group-title">${esc(group.label)}</h3>
            <div class="preset-grid">
              ${group.presets.map((preset) => `
                <button type="button" class="preset-card" data-preset-card data-preset="${preset.index}" data-category="${group.key}" data-search="${esc(presetSearchText(preset))}">
                  <span class="preset-name">${esc(preset.label)}</span>
                  <span class="preset-desc">${esc(preset.description)}</span>
                </button>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <p class="muted small preset-empty hidden" data-preset-empty>No category matches that search. Try “shirt”, “jeans” or “watch”, or create a blank chart.</p>
    </div>`;
}

export function bindPresetPicker(root) {
  if (!root || root.dataset.presetPickerBound) return;
  root.dataset.presetPickerBound = 'true';

  root.addEventListener('click', (event) => {
    const chip = event.target.closest?.('[data-preset-category]');
    if (!chip) return;
    const picker = chip.closest('[data-preset-picker]');
    if (!picker) return;
    picker.querySelectorAll('[data-preset-category]').forEach((item) => item.classList.toggle('is-active', item === chip));
    applyPresetFilter(picker);
  });

  root.addEventListener('input', (event) => {
    if (!event.target.matches?.('[data-preset-search]')) return;
    const picker = event.target.closest('[data-preset-picker]');
    if (picker) applyPresetFilter(picker);
  });

  root.addEventListener('keydown', (event) => {
    if (!event.target.matches?.('[data-preset-search]') || event.key !== 'Escape' || !event.target.value) return;
    event.target.value = '';
    applyPresetFilter(event.target.closest('[data-preset-picker]'));
  });
}

export function applyPresetFilter(picker) {
  if (!picker) return;
  const term = (picker.querySelector('[data-preset-search]')?.value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ');
  const words = term.split(/\s+/).filter(Boolean);
  const active = picker.querySelector('[data-preset-category].is-active')?.dataset.presetCategory ?? 'all';

  let visible = 0;
  picker.querySelectorAll('[data-preset-card]').forEach((card) => {
    const inCategory = active === 'all' || card.dataset.category === active;
    const text = card.dataset.search ?? '';
    const matches = words.every((word) => text.includes(word) || (word.length > 3 && word.endsWith('s') && text.includes(word.slice(0, -1))));
    const show = inCategory && matches;
    card.classList.toggle('hidden', !show);
    if (show) visible += 1;
  });

  picker.querySelectorAll('[data-preset-group]').forEach((group) => {
    const hasVisible = group.querySelector('[data-preset-card]:not(.hidden)') !== null;
    group.classList.toggle('hidden', !hasVisible);
  });

  picker.querySelector('[data-preset-empty]')?.classList.toggle('hidden', visible > 0);
}
