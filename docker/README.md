# Docker container for RaspberryTV

This is a containerization of the RaspberryTV project. Cron tasks were added to sync the channels list and the EPG(s).

Containerization allows to self-host the application to make it work on a local private server.

## Build process

1. Clone the repo `git clone repo-url`
2. Move to the cloned repo `cd repo`
3. Build the container with `docker build -t raspberry-tv -f docker/Dockerfile .`
4. Run the container with `docker run -it -p 8080:80 raspberry-tv`

## Access the container

Open the web browser and point to the machine where the container is running: `http://address:8080`

## How to automate the Docker containers creation and publish process

### Docker Hub preparation

#### Docker Hub account

1. Create a free Docker Hub account [here](https://hub.docker.com/)
2. Once the account is confirmed, go to "Account Settings" and then "Security"
3. Generate a new "Access Token" and copy the provided key

#### Create Image repository

1. In the top bar select "Repositories"
2. Create a new "Repository" following the steps

### GitHub Preparation

#### GitHub Settings

1. Go in the repo Settings, select "Secrets and Variables"
2. Select "Actions"
3. Create a new Repository Secret called `DOCKERHUB_IMAGENAME` and set paste the image name, should look like "username/imagename"
4. Create a new Repository Secret called `DOCKERHUB_TOKEN` and paste the Docker Hub token
5. Create a new Repository Secret called `DOCKERHUB_USERNAME` and enter your Docker Hub username

#### GitHub action

1. Create a `./github/workflows/docker.yml
2. Paste the following code:

```yaml
name: Push Docker image to the Hub

on:
  push:
    # Pattern matched against refs/tags
    tags:        
      - '*'           # Push events to every tag not containing

  workflow_dispatch:

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - uses: actions-ecosystem/action-get-latest-tag@v1
        id: get-latest-tag
      - name: Print latest tag
        run: echo ${{ steps.get-latest-tag.outputs.tag }}
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./
          file: ./docker/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ secrets.DOCKERHUB_IMAGENAME }}:${{ steps.get-latest-tag.outputs.tag }},${{ secrets.DOCKERHUB_IMAGENAME }}:latest
```

### Publishing new image

Image is automatically published every time a new release is created, no need to manually operate.
