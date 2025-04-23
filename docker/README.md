# Docker container for RaspberryTV

## Build process

1. Clone the repo `git clone repo-url`
2. Move to the cloned repo `cd repo`
3. Build the container with `docker build -t raspberry-tv -f docker/Dockerfile .`
4. Run the container with `docker run -it -p 8080:80 raspberry-tv`

## Access the container

Open the web browser and point to the machine where the container is running: `http://address:8080`
