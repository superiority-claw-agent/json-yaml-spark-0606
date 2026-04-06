function fallbackCopy(text) {
  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();

  let copied = false;

  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  textarea.remove();
  return copied;
}

export async function copyText(text) {
  if (!text) {
    return {
      ok: false,
      message: 'Nothing to copy yet.'
    };
  }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return {
        ok: true,
        message: 'Copied to clipboard'
      };
    }
  } catch {
    // Try the legacy fallback below.
  }

  if (fallbackCopy(text)) {
    return {
      ok: true,
      message: 'Copied to clipboard'
    };
  }

  return {
    ok: false,
    message: 'Clipboard access was blocked. You can still select and copy the output manually.'
  };
}
