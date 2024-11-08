const socketIO = require('socket.io');
const io = socketIO();

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('new-sale', async (saleData) => {
        try {
            const sale = new Sale(saleData);
            await sale.save();

            const userId = saleData.vendor;
            const user = await User.findById(userId);
            user.commission += saleData.commission;
            await user.save();
            io.emit('commission-update', user.commission);
        } catch (error) {
            console.error(error);
        }
    });
});




