const socketIO = require('socket.io');
const io = socketIO();

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('new-sale', async (saleData) => {
        try {
            const sale = new Sale(saleData);
            await sale.save();

            // Update sales data in real-time
            io.emit('sales-update', sale);
        } catch (error) {
            console.error(error);
        }
    });
});
