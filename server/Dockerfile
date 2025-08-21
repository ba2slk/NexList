# Multi-Staged-Build

FROM python:3.12-slim AS builder

WORKDIR /app

RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt


FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /app/wheels /app/wheels
RUN pip install --no-cache /app/wheels/*

COPY ./nexlist /app/nexlist
COPY ./alembic /app/alembic
COPY alembic.ini /app/

EXPOSE 8000

CMD ["uvicorn", "nexlist.app:app", "--host", "0.0.0.0", "--port", "8000"]
