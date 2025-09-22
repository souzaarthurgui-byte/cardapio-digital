document.addEventListener('DOMContentLoaded', () => {
    const summaryItems = document.getElementById('summary-items');
    const summaryTotal = document.getElementById('summary-total-price');
    const checkoutForm = document.querySelector('.order-form');

    const savedCart = localStorage.getItem('cart');
    const cartData = savedCart ? JSON.parse(savedCart) : [];

    let total = 0;

    summaryItems.innerHTML = '';
    if (cartData.length === 0) {
        summaryItems.innerHTML = '<li>Seu carrinho está vazio.</li>';
    } else {
        cartData.forEach(item => {
            const li = document.createElement('li');
            const itemTotal = item.quantity * item.price;
            li.textContent = `${item.name} (x${item.quantity}) - R$ ${itemTotal.toFixed(2)}`;
            summaryItems.appendChild(li);
            total += itemTotal;
        });
    }

    summaryTotal.textContent = total.toFixed(2);
    
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tableNumber = document.getElementById('table-number').value;
        const customerName = document.getElementById('customer-name').value;
        const notes = document.getElementById('notes').value;

        const finalOrder = {
            items: cartData,
            total: total,
            table: tableNumber,
            name: customerName,
            notes: notes,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('http://192.168.1.12:3000/api/pedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalOrder)
            });

            if (response.ok) {
                localStorage.removeItem('cart');
                localStorage.setItem('finalOrder', JSON.stringify(finalOrder));
                window.location.href = 'confirmacao.html';
            } else {
                alert('Erro ao enviar o pedido. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
        }
    });
});