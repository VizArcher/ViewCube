FROM python:3.10-slim

# Install system dependencies for VTK/Mesa (Software Rendering)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-dev \
    libosmesa6-dev \
    mesa-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the server code
COPY . .

# Render dynamically assigns a port; we use 8080 as a default
EXPOSE 8080

# The command to start your trame server
CMD ["python", "server.py", "--host", "0.0.0.0", "--port", "8080"]