FROM python:3.14-slim
RUN pip install --no-cache-dir tokenizers 'psycopg[binary]'
ENV PYTHONUNBUFFERED=1
WORKDIR /harness
CMD ["python", "input/main.py"]
