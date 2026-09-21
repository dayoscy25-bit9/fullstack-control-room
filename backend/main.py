from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="FullStack Control Room")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TraceEvent(BaseModel):
    trace_id: str
    component: str
    event: str
    operation: str | None = None


traces = {}


@app.get("/")
def root():
    return {
        "mensaje": "FullStack Control Room funcionando"
    }


@app.post("/traces")
def create_trace(trace: TraceEvent):

    if trace.trace_id not in traces:
        traces[trace.trace_id] = []

    traces[trace.trace_id].append(trace.model_dump())

    return {
        "received": True,
        "trace_id": trace.trace_id
    }

@app.get("/traces/latest")
def get_latest_trace():
    if not traces:
        raise HTTPException(
            status_code=404,
            detail="No hay traces disponibles"
        )

    latest_trace_id = next(reversed(traces))

    return {
        "trace_id": latest_trace_id,
        "events": traces[latest_trace_id]
    }


@app.get("/traces/{trace_id}")
def get_trace(trace_id: str):

    if trace_id not in traces:
        raise HTTPException(
            status_code=404,
            detail="Trace no encontrado"
        )

    return {
        "trace_id": trace_id,
        "events": traces[trace_id]
    }