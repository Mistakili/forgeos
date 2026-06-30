# Stage 1: Build React UI
FROM node:20-alpine AS ui-build
WORKDIR /app/ui
COPY ui/package.json ui/package-lock.json* ./
RUN npm ci 2>/dev/null || npm install
COPY ui/ ./
RUN npm run build

# Stage 2: Python API + static UI
FROM python:3.11-slim
WORKDIR /app

ENV FORGE_ENV=production
ENV PYTHONUNBUFFERED=1
ENV FORGE_HOST=0.0.0.0
ENV FORGE_PORT=8000

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=ui-build /app/ui/dist ./ui/dist

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health')"

CMD ["python", "-m", "api.server"]