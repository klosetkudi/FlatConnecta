import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function BuyersTestPage() {
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadBuyers() {
      try {
        const { data, error } = await supabase
          .from('buyers')
          .select('*')

        if (error) {
          console.error(error)
          setErrorMessage(error.message)
          return
        }

        setBuyers(data || [])
      } catch (err) {
        console.error(err)
        setErrorMessage('Unexpected error')
      } finally {
        setLoading(false)
      }
    }

    loadBuyers()
  }, [])

  if (loading) {
    return <div>Loading buyers from Supabase...</div>
  }

  if (errorMessage) {
    return <div>Error: {errorMessage}</div>
  }

  return (
    <div>
      <h1>Buyers from Supabase</h1>
      {buyers.length === 0 && <p>No buyers found.</p>}
      <ul>
        {buyers.map(buyer => (
          <li key={buyer.id}>
            {buyer.name} – {buyer.email} – {buyer.mobile}
          </li>
        ))}
      </ul>
    </div>
  )
}
