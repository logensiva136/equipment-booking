# Dev-oriented image: mirrors `uv run python manage.py runserver` from the
# existing local workflow. Not hardened for production (DEBUG stays on via
# config/settings.py, no gunicorn/nginx) -- that's a separate task.
FROM ghcr.io/astral-sh/uv:debian-slim

WORKDIR /app

# uv downloads and manages the exact Python version pyproject.toml asks
# for (>=3.14) itself, so no system Python is needed in the base image.
ENV UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

# Install dependencies first so this layer is cached unless the
# lockfile changes, independent of application code edits.
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project

COPY . .
RUN uv sync --locked && chmod +x docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]
