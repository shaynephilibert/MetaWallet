chrome.runtime.onMessage.addListener((message: { type: string; prompt: string }) => {
  if (message.type === 'INJECT_PROMPT') {
    const input = document.querySelector(
      '[contenteditable="true"].ProseMirror'
    ) as HTMLElement;
    if (input) {
      input.focus();
      // ProseMirror requires document.execCommand for proper React/framework integration
      document.execCommand('selectAll', false);
      document.execCommand('insertText', false, message.prompt);
    }
  }
});
