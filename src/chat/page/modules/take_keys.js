// Makes Enter send and Ctrl-Enter start a new line, since the browser does neither on its own.
export function takeKeys(box, form, grew) {
  box.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) {
      return;
    }
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      event.preventDefault();
      const at = box.selectionStart;
      box.setRangeText("\n", at, box.selectionEnd, "end");
      grew();
      return;
    }
    event.preventDefault();
    form.requestSubmit();
  });
}
