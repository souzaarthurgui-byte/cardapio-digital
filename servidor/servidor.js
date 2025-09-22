const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const ordersFilePath = path.join(__dirname, 'pedidos.json');

app.use(express.json());
app.use(cors());

// Endpoint para receber e salvar um novo pedido
app.post('/api/pedido', (req, res) => {
  const newOrder = {
    ...req.body,
    status: 'novo'
  };
  fs.readFile(ordersFilePath, 'utf8', (err, data) => {
    let orders = [];
    if (!err && data) {
      try {
        orders = JSON.parse(data);
      } catch (parseError) {
        console.error('Erro ao fazer parse do arquivo pedidos.json:', parseError);
      }
    }
    orders.push(newOrder);
    fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (err) => {
      if (err) {
        console.error('Erro ao salvar o pedido:', err);
        return res.status(500).send('Erro ao salvar o pedido.');
      }
      res.status(200).send('Pedido recebido e salvo.');
    });
  });
});

// Endpoint para atualizar o status de um pedido
app.put('/api/pedido/status', (req, res) => {
  const { timestamp, newStatus } = req.body;
  fs.readFile(ordersFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler os pedidos.');
    }
    let orders = JSON.parse(data);
    const orderToUpdate = orders.find(order => order.timestamp === timestamp);
    if (!orderToUpdate) {
      return res.status(404).send('Pedido não encontrado.');
    }
    orderToUpdate.status = newStatus;
    fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (err) => {
      if (err) {
        console.error('Erro ao atualizar o status:', err);
        return res.status(500).send('Erro ao atualizar o status.');
      }
      res.status(200).send('Status atualizado.');
    });
  });
});

// Endpoint para excluir um pedido
app.delete('/api/pedido', (req, res) => {
  const { timestamp } = req.body;
  fs.readFile(ordersFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler os pedidos.');
    }
    let orders = JSON.parse(data);
    const updatedOrders = orders.filter(order => order.timestamp !== timestamp);
    fs.writeFile(ordersFilePath, JSON.stringify(updatedOrders, null, 2), (err) => {
      if (err) {
        console.error('Erro ao excluir o pedido:', err);
        return res.status(500).send('Erro ao excluir o pedido.');
      }
      res.status(200).send('Pedido excluído.');
    });
  });
});

// Endpoint para enviar a lista de pedidos para o painel
app.get('/api/pedidos', (req, res) => {
  fs.readFile(ordersFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(200).json([]);
    }
    const orders = JSON.parse(data);
    res.status(200).json(orders);
  });
});

// Serve os arquivos estáticos do cardápio
app.use(express.static('../'));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});