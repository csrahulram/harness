


const socket = new WebSocket(`ws://${location.host}`);

function send(action, model) {
    socket.send(JSON.stringify({ action, model }));
}

function renderStack(stack) {
    content.innerHTML = '';

    for (const [model, state] of Object.entries(stack)) {
        const block = document.createElement('div');
        block.className = 'block';
        block.style.background = randomColor();
        block.textContent = `${model} — ${state}`;
        block.onclick = () => send('unload', model);
        content.append(block);
    }
}

socket.addEventListener('open', () => send('list', ''));
socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.type === 'stack') renderStack(data.stack);
});
