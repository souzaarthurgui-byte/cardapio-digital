document.addEventListener('DOMContentLoaded', () => {
    const newOrdersList = document.getElementById('new-orders');
    const inPreparationOrdersList = document.getElementById('in-preparation-orders');
    const readyOrdersList = document.getElementById('ready-orders');
    const noOrdersMessage = document.getElementById('no-orders-message');

    const serverURL = 'https://cardapio-digital-teal.vercel.app';

    async function fetchOrders() {
        try {
            const response = await fetch(`${serverURL}/api/pedidos`);
            const orders = await response.json();

            if (orders.length === 0) {
                noOrdersMessage.style.display = 'block';
            } else {
                noOrdersMessage.style.display = 'none';
            }
            renderOrders(orders);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            noOrdersMessage.textContent = 'Não foi possível carregar os pedidos. Verifique o servidor.';
            noOrdersMessage.style.display = 'block';
        }
    }

    function renderOrders(orders) {
        newOrdersList.innerHTML = '';
        inPreparationOrdersList.innerHTML = '';
        readyOrdersList.innerHTML = '';

        orders.forEach(orderData => {
            const orderCard = document.createElement('div');
            orderCard.classList.add('order-card');
            orderCard.innerHTML = `
                <div class="card-content">
                    <div class="card-header">
                        <h3>Mesa #${orderData.table}</h3>
                        <span class="status-badge status-${orderData.status.replace(/ /g, '-')}">${orderData.status.toUpperCase()}</span>
                    </div>
                    <p class="customer-name">Cliente: ${orderData.name || 'Não informado'}</p>
                    <div class="order-total">Total: R$ ${orderData.total.toFixed(2)}</div>
                    
                    <div class="item-details hidden">
                        <p class="details-title">Detalhes do Pedido:</p>
                        <ul class="details-list">
                            ${orderData.items.map(item => `
                                <li>${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}</li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="card-actions">
                        <button class="details-button">Ver Itens</button>
                        <button class="status-button" data-timestamp="${orderData.timestamp}" data-status="${orderData.status}">
                            ${orderData.status === 'pronto' ? 'Entregue' : 'Próximo Status'}
                        </button>
                    </div>
                </div>
            `;

            if (orderData.status === 'novo') {
                newOrdersList.appendChild(orderCard);
            } else if (orderData.status === 'em preparacao') {
                inPreparationOrdersList.appendChild(orderCard);
            } else if (orderData.status === 'pronto') {
                readyOrdersList.appendChild(orderCard);
            }
        });

        document.querySelectorAll('.status-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const timestamp = e.target.dataset.timestamp;
                let currentStatus = e.target.dataset.status;
                let nextStatus;

                if (currentStatus === 'novo') {
                    nextStatus = 'em preparacao';
                } else if (currentStatus === 'em preparacao') {
                    nextStatus = 'pronto';
                } else if (currentStatus === 'pronto') {
                    await fetch(`${serverURL}/api/pedido`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ timestamp: timestamp })
                    });
                    fetchOrders();
                    return;
                }

                try {
                    await fetch(`${serverURL}/api/pedido/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ timestamp: timestamp, newStatus: nextStatus })
                    });
                    fetchOrders();
                } catch (error) {
                    console.error('Erro ao atualizar status:', error);
                }
            });
        });

        document.querySelectorAll('.details-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const details = e.target.closest('.order-card').querySelector('.item-details');
                details.classList.toggle('hidden');
                e.target.textContent = details.classList.contains('hidden') ? 'Ver Itens' : 'Ocultar Itens';
            });
        });
    }

    fetchOrders();
    setInterval(fetchOrders, 5000);
});