FROM python:3.12-slim-buster

WORKDIR /app

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend .

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "51251"]