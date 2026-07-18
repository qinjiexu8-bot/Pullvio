ARG DENO_VERSION=2.9.3
FROM denoland/deno:bin-${DENO_VERSION} AS deno

FROM python:3.13-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DENO_NO_UPDATE_CHECK=1 \
    DENO_NO_PROMPT=1

COPY --from=deno /deno /usr/local/bin/deno

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates ffmpeg tini \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 pullvio \
    && useradd --system --uid 10001 --gid pullvio --home /app --shell /usr/sbin/nologin pullvio

WORKDIR /app
COPY requirements.txt ./
RUN pip install --requirement requirements.txt

COPY pullvio_worker ./pullvio_worker
RUN mkdir -p /work && chown pullvio:pullvio /work

USER 10001:10001
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["python", "-m", "pullvio_worker.worker"]
