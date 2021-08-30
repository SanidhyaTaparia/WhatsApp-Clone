import React, { useContext, useState, useEffect, useCallback } from 'react'
import useLocalStorage from '../hooks/useLocalStorage';
import { useContacts } from './ContactsProvider';
import { useSocket } from './SocketProvider';

const ConversationsContext = React.createContext()

export function useConversations() {
  return useContext(ConversationsContext)
}

export function ConversationsProvider({ id, children }) {
  const [conversations, setConversations] = useLocalStorage('conversations', [])
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0)
  const { contacts } = useContacts()
  const socket = useSocket()

  function createConversation(recipients) { //recipients are the ids which we selected earlier in the NewConversationModal.js(prevSelectedContactIds array's components == recipients)
    setConversations(prevConversations => {
      return [...prevConversations, { recipients, messages: [] }]
    })
  }

  // This addMessageToConversation functions both time when we send message to others or when others send message to us
  // This addMessagetoConversation is not used directly but used within the sendMessage function which is later called in the OpenConversation.js
  // Here this addMessageToConversation is not made a function and is used as a callback so that it changes only once when we run the programme and doesnt gets called(and ofc changed) multiple times otherwise it will create problem in line 62
  const addMessageToConversation = useCallback(({ recipients, text, sender }) => {
    setConversations(prevConversations => {
      let madeChange = false
      const newMessage = { sender, text }
      const newConversations = prevConversations.map(conversation => {
        if (arrayEquality(conversation.recipients, recipients)) {
          madeChange = true
          return {
            ...conversation,
            messages: [...conversation.messages, newMessage] // Adding the new message to the already formed conversation "OR......."
          }
        }

        return conversation
      })

      if (madeChange) {
        return newConversations
      } else {
        return [
          ...prevConversations,
          { recipients, messages: [newMessage] } // "......OR" Creating a new conversation with the new message in it
        ]
      }
    })
  }, [setConversations])


  // For receiving the message
  useEffect(() => {
    if (socket == null) return

    socket.on('receive-message', addMessageToConversation) // This is executed when connection is established well between the client and the server 
    // basically whenever connection establishes then the socket.on's second argument will run on the client side

    return () => socket.off('receive-message')
  }, [socket, addMessageToConversation])


  // For sending the message
  function sendMessage(recipients, text) {
    socket.emit('send-message', { recipients, text })

    addMessageToConversation({ recipients, text, sender: id })
  }

  const formattedConversations = conversations.map((conversation, index) => {
    const recipients = conversation.recipients.map(recipient => { //This recipients == id(an item of prevSelectedIds array) => and we change it to recipients havoimng id and name both
      const contact = contacts.find(contact => { // This const "contact" is the new cntact with id and name that we want to enter in the formattedConversations and the contact used in "contacts.find()" is the element of contact array(got from ContactsProvider.js)
        return contact.id === recipient
      })
      const name = (contact && contact.name) || recipient
      return { id: recipient, name }
    })

    const messages = conversation.messages.map(message => {
      const contact = contacts.find(contact => {
        return contact.id === message.sender
      })
      const name = (contact && contact.name) || message.sender
      const fromMe = id === message.sender
      return { ...message, senderName: name, fromMe }
    })
    
    const selected = index === selectedConversationIndex

    return { ...conversation, messages, recipients, selected }
  })

  const value = {
    conversations: formattedConversations,
    selectedConversation: formattedConversations[selectedConversationIndex], // Used in dasboard.js for displaying the conversation which is selected
    sendMessage,
    selectConversationIndex: setSelectedConversationIndex, // For selection of conversation from the array "conversations"
    createConversation
  }

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  )
}

function arrayEquality(a, b) {
  if (a.length !== b.length) return false

  a.sort()
  b.sort()

  return a.every((element, index) => {
    return element === b[index]
  })
}