function call(method, id) {
  try {
    const result = globalThis.shopify?.saveBar?.[method]?.(id);
    result?.catch?.(() => {});
  } catch {
    // Outside the Shopify admin (local harness) there is no save bar.
  }
}

export function showSaveBar(id) {
  call('show', id);
}

export function hideSaveBar(id) {
  call('hide', id);
}
