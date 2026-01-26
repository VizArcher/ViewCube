FROM python:3.10-slim

# Install system dependencies for VTK/OpenGL rendering
RUN apt-get update && apt-get install -y \
    libgl1-mesa-dev \
    libosmesa6-dev \
    mesa-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir trame trame-vuetify trame-vtk vtk

# Render uses the PORT environment variable
EXPOSE 8080

# Use the --host and --port flags so Render can route traffic
CMD ["python", "server.py", "--host", "0.0.0.0", "--port", "8080"]