const io = require('socket.io')(5000)

io.on('connection', socket => {
  const id = socket.handshake.query.id //Basically create a new socket id(kind of phone number) every time we change to a new  id(this id is like the name of the person)
  // Matlab har baar jab name change hua user ka to phone number bhi to badla na
  socket.join(id)

  socket.on('send-message', ({ recipients, text }) => {
    recipients.forEach(recipient => {
      const newRecipients = recipients.filter(r => r !== recipient)
      newRecipients.push(id) // Basically we are adding the person sending the message and removing the person receiving the message in the newRecipients array because jisko message bhejna tha ab uska recipients mein no use, but jo khud sender h uska to use ho sakta na
      socket.broadcast.to(recipient).emit('receive-message', {
        recipients: newRecipients, sender: id, text
      }) // broadcast to means send to the server side of that variable(here to the recipient) emit means the thing to be broadcasted
      // the .emit is used to send anything from the CLIENT TO THE SERVER
    })
  })
})