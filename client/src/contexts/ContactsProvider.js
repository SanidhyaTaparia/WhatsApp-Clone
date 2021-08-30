import React, { useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage';

const ContactsContext = React.createContext()

export function useContacts() {
  return useContext(ContactsContext)
}

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useLocalStorage('contacts', [])

  function createContact(id, name) {
    setContacts(prevContacts => {
      return [...prevContacts, { id, name }]
    })
  }

  return (
    <ContactsContext.Provider value={{ contacts, createContact }}> 
    {/*The thing coming before .Provider is the value of line4(i.e. ContactsContext, which is used for React.createContext, now whenever we write useContext(value before .provider/here it is "ContactsContext") then we can access all the things available in the "value={}" of that .Provider Function*/}
      {children}
    </ContactsContext.Provider>
  )
}
