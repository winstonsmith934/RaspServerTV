# Docker container for RaspberryTV

This is a containerization of the RaspberryTV project. Cron tasks were added to sync the channels list and the EPG(s).

Containerization allows to self-host the application to make it work on a local private server.

## Docker options

### Manually build and run the container

1. Clone the repo `git clone repo-url`
2. Move to the cloned repo `cd repo`
3. Build the container with `docker build -t raspservertv -f docker/Dockerfile .`
4. Run the container with `docker run -itd -p 8080:80 raspservertv`

### Use a prebuilt image

1. Run `docker run -itd -p 8080:80 ghcr.io/username/raspservertv`
   - Replace `username` with the owner of the repo who built the image, like: `ghcr.io/iu2frl/raspservertv`

## Access the container

Open the web browser and point to the machine where the container is running: `http://address:8080`

## Automate build and publish process to ghcr

### GitHub Preparation

#### GitHub Settings

1. Go in the repo Settings, select "Actions", then "General"
2. Set the "Workflow permissions" to "Read and write permissions"

#### GitHub action

1. The `.github/workflows/ghcr.yml` file was created to build the docker container automatically at every new release of the project.
   - Output is uploaded to `ghcr.io/username/raspservertv`

### Publishing new image

Image is automatically published every time a new release is created, no need to manually operate.
