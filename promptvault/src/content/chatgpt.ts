chrome.runtime.onMessage.addListener((message: { type: string; prompt: string }) => {
  if (message.type === 'INJECT_PROMPT') {
    // Try contenteditable ProseMirror div first (current ChatGPT)
    const prosemirror = document.querySelector(
      '#prompt-textarea[contenteditable="true"], div[contenteditable="true"].ProseMirror, #composer-background [contenteditable="true"]'
    ) as HTMLElement | null;

    if (prosemirror) {
      prosemirror.focus();
      document.execCommand('selectAll', false);
      document.execCommand('insertText', false, message.prompt);
      return;
    }

    // Fallback: legacy textarea
    const textarea = document.querySelector('#prompt-textarea') as HTMLTextAreaElement | null;
    if (textarea) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;
      setter?.call(textarea, message.prompt);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  }
});
