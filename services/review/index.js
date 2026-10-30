const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/review.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const reviewProto = grpc.loadPackageDefinition(packageDefinition);
const reviews = [];
const server = new grpc.Server();

server.addService(reviewProto.ReviewService.service, {
    GetReviews: (call, callback) => {
        const productReviews = reviews.filter((review) => review.productId === call.request.id);
        callback(null, { reviews: productReviews });
    },
    AddReview: (call, callback) => {
        const review = {
            ...call.request,
            date: new Date().toISOString(),
        };
        reviews.push(review);

        callback(null, {
            success: true,
            message: 'Avaliação adicionada com sucesso!',
        });
    },
});

server.bindAsync('0.0.0.0:3003', grpc.ServerCredentials.createInsecure(), (error) => {
    if (error) {
        console.error('Failed to start Review Service:', error);
        return;
    }
    console.log('Reviews Service running at http://127.0.0.1:3003');
});
