document.addEventListener('DOMContentLoaded', () => {
    const mesaSpan = document.getElementById('mesa-confirmacao');
    const nomeSpan = document.getElementById('nome-confirmacao');
    const obsSpan = document.getElementById('obs-confirmacao');
    const summaryItemsList = document.getElementById('summary-items-confirmacao');
    const summaryTotalPrice = document.getElementById('summary-total-price-confirmacao');

    // Carrega os dados do pedido final do localStorage
    const finalOrder = JSON.parse(localStorage.getItem('finalOrder'));

    if (finalOrder) {
        mesaSpan.textContent = finalOrder.table;
        nomeSpan.textContent = finalOrder.name || 'Não informado';
        obsSpan.textContent = finalOrder.notes || 'Nenhuma';

        // Preenche o resumo do pedido
        summaryItemsList.innerHTML = '';
        finalOrder.items.forEach(item => {
            const li = document.createElement('li');
            const itemTotal = item.quantity * item.price;
            li.textContent = `${item.name} (x${item.quantity}) - R$ ${itemTotal.toFixed(2)}`;
            summaryItemsList.appendChild(li);
        });

        summaryTotalPrice.textContent = finalOrder.total.toFixed(2);
        
        // Limpa o pedido final para que não apareça na próxima visita
        localStorage.removeItem('finalOrder');

    } else {
        // Redireciona de volta se não houver dados de pedido
        window.location.href = 'index.html';
    }
});