// Reads a picture the person chose into something that can be posted as text.
export function readFile(file) {
  return new Promise((keep, fail) => {
    const reader = new FileReader();
    reader.onload = () => keep({ name: file.name, data: reader.result });
    reader.onerror = () => fail(new Error("that file could not be read"));
    reader.readAsDataURL(file);
  });
}
