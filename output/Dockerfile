FROM python:3.14-slim
RUN pip install --no-cache-dir 'psycopg[binary]'
ENV PYTHONUNBUFFERED=1
WORKDIR /harness
CMD ["python", "output/main.py"]
