const express = require('express');
const shipping = require('./shipping');
const inventory = require('./inventory');
const reviews = require('./review');
const grpc = require('@grpc/grpc-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res, next) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res, next) => {
    shipping.GetShippingRate(
        {
            cep: req.params.cep,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.cep,
                    value: data.value,
                });
            }
        }
    );
});

/**
 * Retorna um produto pelo seu ID via InventoryService
 */
app.get('/product/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 0 || id > 2147483647) {
        res.status(400).send({ error: 'Invalid product ID' });
        return;
    }

    inventory.SearchProductByID({ id }, (err, product) => {
        if (err) {
            console.error(err);
            const isNotFound = err.code === grpc.status.NOT_FOUND;
            res.status(isNotFound ? 404 : 500).send({
                error: isNotFound ? 'Product not found' : 'something failed :(',
            });
        } else {
            res.json(product);
        }
    });
});

/**
 * Retorna as avaliações de um produto via ReviewService
 */
app.get('/reviews/:id', (req, res) => {
    reviews.GetReviews({ id: Number(req.params.id) }, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Falha ao recuperar avaliações' });
        } else {
            res.json(data);
        }
    });
});

/**
 * Adiciona uma avaliação via ReviewService
 */
app.post('/reviews', (req, res) => {
    const review = {
        productId: req.body.productId,
        username: req.body.username,
        rating: req.body.rating,
        comment: req.body.comment,
    };

    reviews.AddReview(review, (err, response) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Falha ao adicionar avaliação' });
        } else {
            res.json(response);
        }
    });
});

/**
 * Inicia o router
 */
app.listen(3000, () => {
    console.log('Controller Service running on http://127.0.0.1:3000');
});
