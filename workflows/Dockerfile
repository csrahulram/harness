FROM python:3.14-slim
RUN pip install --no-cache-dir torch==2.14.0 \
    --index-url https://download.pytorch.org/whl/cu130
RUN pip install --no-cache-dir transformers==5.17.0
RUN pip install --no-cache-dir diffusers accelerate trimesh
RUN pip install --no-cache-dir 'psycopg[binary]'
RUN pip uninstall -y triton
ENV PYTHONUNBUFFERED=1
ENV HF_HUB_OFFLINE=1
ENV PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True
WORKDIR /harness
CMD ["python", "workflows/main.py"]
