FROM python:3.10.8-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev

COPY . /app

RUN pip install --no-cache-dir -r Authentication/requirements.txt

EXPOSE 8000

CMD ["uvicorn", "Authentication.main:app", "--host", "0.0.0.0", "--port", "8000"]