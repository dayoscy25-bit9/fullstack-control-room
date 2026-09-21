import { useEffect, useState } from 'react'
import './App.css'

interface TraceEvent {
  trace_id: string
  component: string
  event: string
  operation: string | null
}

interface TraceResponse {
  trace_id: string
  events: TraceEvent[]
}

function App() {
  const [trace, setTrace] = useState<TraceResponse | null>(null)
  const [error, setError] = useState('')

  
  useEffect(() => {
  const obtenerUltimoTrace = () => {
    console.log('Consultando último trace...')

    fetch('http://127.0.0.1:8010/traces/latest')
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudo obtener el trace')
        }

        return response.json()
      })
      .then((data) => {
        console.log('Trace recibido:', data.trace_id)

        setTrace(data)
        setError('')
      })
      .catch((error) => {
        console.error('Error:', error)
        setError(error.message)
      })
  }

  obtenerUltimoTrace()

  const intervalo = setInterval(() => {
    obtenerUltimoTrace()
  }, 1000)

  return () => {
    clearInterval(intervalo)
  }
}, [])

  if (error) {
    return (
      <div className="app">
        <h1>FullStack Control Room</h1>

        <div className="error">
          {error}
        </div>
      </div>
    )
  }

  if (!trace) {
    return (
      <div className="app">
        <h1>FullStack Control Room</h1>

        <p>Cargando trace...</p>
      </div>
    )
  }

  const operation =
    trace.events.find(
      (event) => event.event === 'request'
    )?.operation

  const hasError = trace.events.some(
    (event) => event.event === 'error'
  )

  return (
    <div className="app">

      <header>
        <h1>FullStack Control Room</h1>

        <p>
          Sala de control del software
        </p>
      </header>

      <section className="trace-info">

        <div>
          <strong>Trace ID</strong>

          <span>
            {trace.trace_id}
          </span>
        </div>

        <div>
          <strong>Operación</strong>

          <span>
            {operation ?? 'Desconocida'}
          </span>
        </div>

        <div>
          <strong>Estado</strong>

          <span className={hasError ? 'status error-status' : 'status'}>
            {hasError
              ? 'ERROR'
              : 'OPERACIÓN EXITOSA'}
          </span>
        </div>

      </section>

      <section className="flow">

        {trace.events.map((event, index) => (

          <div
            className="flow-item"
            key={`${event.component}-${index}`}
          >

            <div
              className={
                event.event === 'error'
                  ? 'component error-component'
                  : 'component'
              }
            >

              <div className="component-status">
                {event.event === 'error'
                  ? '🔴'
                  : '🟢'}
              </div>

              <div>
                <h2>
                  {event.component}
                </h2>

                <p>
                  {event.operation}
                </p>

                <small>
                  Evento: {event.event}
                </small>
              </div>

            </div>

            {index < trace.events.length - 1 && (
              <div className="arrow">
                ↓
              </div>
            )}

          </div>

        ))}

      </section>

    </div>
  )
}

export default App