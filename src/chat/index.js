// Sends the prompt to the API and shows the reply
const form = document.getElementById('prompt-form');
const input = document.getElementById('prompt');
const button = form.querySelector('button');
const output = document.getElementById('output');


const url = "http://localhost:3200"


form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    button.disabled = true;
    output.textContent = 'Working...';

    try {
        const response = await fetch(url + '/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text })
        });

        const data = await response.json();
        output.textContent = data.text ?? JSON.stringify(data);
    } catch (error) {
        output.textContent = `Request failed: ${error.message}`;
    }

    button.disabled = false;
});
