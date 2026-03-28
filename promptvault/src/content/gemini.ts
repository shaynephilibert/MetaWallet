chrome.runtime.onMessage.addListener((message: { type: string; prompt: string }) => {
  if (message.type === 'INJECT_PROMPT') {
    const input = document.querySelector('rich-textarea .ql-editor') as HTMLElement;
    if (input) {
      input.focus();
      document.execCommand('selectAll', false);
      document.execCommand('insertText', false, message.prompt);
    }
  }
});
