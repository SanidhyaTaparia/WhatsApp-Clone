import { useEffect, useState } from 'react'

const PREFIX = 'whatsapp-clone-' //Since there are numerous local storage on the localhost:3000, we use it to avoid confusion

export default function useLocalStorage(key, initialValue) {
  const prefixedKey = PREFIX + key
  const [value, setValue] = useState(() => {
    // For prefixedKey
    const jsonValue = localStorage.getItem(prefixedKey) //stores prefixedKey in local storage of server
    if (jsonValue != null) return JSON.parse(jsonValue)  //.parse is used to convert the data received from the web(which is of type string) to a JS object

    // For initialvalue
    if (typeof initialValue === 'function') {
      return initialValue()
    } else {
      return initialValue
    }
  })

  useEffect(() => {
    console.log("Prefixed Key=",prefixedKey)
    console.log("Value=",value)
    localStorage.setItem(prefixedKey, JSON.stringify(value))
  }, [prefixedKey, value])

  return [value, setValue]
} //This basically sets the prefixedKey to the string form and then again stores in the server

//Basically we are taking the value from web storage in string format, then converting it into json format and then checking whether its null or function or a common value and then again storing the string format of that value accordingly in the web server storage