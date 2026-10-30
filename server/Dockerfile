FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Run as a normal user, not root. UID 1000 matches the usual first user on the
# host, so files the app writes into the mounted project (uploads, the SQLite
# database) stay owned by you.
ARG APP_UID=1000
RUN useradd --create-home --uid ${APP_UID} app

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=app:app . .

USER app

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
