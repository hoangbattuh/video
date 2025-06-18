# Video Editor Pro - Installation and Troubleshooting Guide

## System Requirements

This Electron-based video editing application requires specific system dependencies to run properly on Linux systems.

## Common Issues and Solutions

### Issue: `libnss3.so: cannot open shared object file: No such file or directory`

This error occurs when the required NSS (Network Security Services) libraries are not installed on your system.

#### Solution for Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install libnss3 libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev
```

#### Solution for CentOS/RHEL/Fedora:

```bash
sudo yum install nss nss-devel gtk3-devel libXScrnSaver-devel
# or for newer versions:
sudo dnf install nss nss-devel gtk3-devel libXScrnSaver-devel
```

#### Solution for Docker environments:

Add this to your Dockerfile:

```dockerfile
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnss3-dev \
    libgdk-pixbuf2.0-dev \
    libgtk-3-dev \
    libxss-dev \
    libasound2-dev \
    && rm -rf /var/lib/apt/lists/*
```

### Additional Linux Dependencies

For full functionality, you may also need:

```bash
sudo apt-get install -y \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libgtk-4-1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2
```

## Installation Steps

1. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

2. **Install system dependencies (if needed):**

   ```bash
   sudo apt-get update
   sudo apt-get install libnss3 libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev
   ```

3. **Build the application:**

   ```bash
   npm run build
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

## Development Mode

For development with automatic rebuilding:

```bash
npm run start-dev
```

## Troubleshooting

### If Electron fails to start:

1. **Check system dependencies:**

   ```bash
   ldd node_modules/electron/dist/electron
   ```

2. **Try running with additional flags:**

   ```bash
   npm run start-electron
   ```

3. **Run in headless mode (for servers):**
   ```bash
   DISPLAY=:99 npm start
   ```

### Alternative: Web-based Development

If Electron fails to start due to system limitations, you can use the web-based development mode:

```bash
npm run dev-web
```

This will start a webpack dev server that serves the React application in a browser.

## Environment Variables

You can set these environment variables to customize the application:

- `ELECTRON_DISABLE_SANDBOX=1` - Disables Electron's sandbox (less secure but may fix startup issues)
- `ELECTRON_DISABLE_GPU=1` - Disables GPU acceleration (for headless environments)
- `DISPLAY=:0` - Sets the display for X11 forwarding

## Container/Docker Usage

When running in containers, make sure to:

1. Install all required system dependencies
2. Set appropriate environment variables
3. Forward the X11 display if running with GUI
4. Use `--no-sandbox` flags for Electron

Example Docker run command:

```bash
docker run -it --rm \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  your-video-editor-image
```
