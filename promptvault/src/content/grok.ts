chrome.runtime.onMessage.addListener((message: { type: string; prompt: string }) => {
  if (message.type === 'INJECT_PROMPT') {
    const input = document.querySelector('textarea[placeholder]') as HTMLTextAreaElement;
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, message.prompt);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    }
  }
});
