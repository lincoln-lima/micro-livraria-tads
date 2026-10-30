const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const products = require('./products.json');

const packageDefinition = protoLoader.loadSync('proto/inventory.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const inventoryProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// implementa os métodos do InventoryService
server.addService(inventoryProto.InventoryService.service, {
    SearchAllProducts: (_, callback) => {
        callback(null, {
            products: products,
        });
    },
    SearchProductByID: (call, callback) => {
        const product = products.find((item) => item.id === call.request.id);

        if (!product) {
            callback({
                code: grpc.status.NOT_FOUND,
                details: 'Product not found',
            });
            return;
        }

        callback(null, product);
    },
});

server.bindAsync('127.0.0.1:3002', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Inventory Service running at http://127.0.0.1:3002');
});
