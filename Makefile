DOCKER_USER ?= sergiors
IMAGE_NAME ?= loopdeck
TAG ?= latest

IMAGE = $(DOCKER_USER)/$(IMAGE_NAME):$(TAG)

PLATFORM ?= linux/amd64

.PHONY: build push release run login

build:
	docker buildx build \
		--platform $(PLATFORM) \
		-t $(IMAGE) \
		--load .

push:
	docker buildx build \
		--platform $(PLATFORM) \
		-t $(IMAGE) \
		--push .

release:
	docker buildx build \
		--platform $(PLATFORM) \
		-t $(IMAGE) \
		--push .

run:
	docker run --rm -p 3000:3000 $(IMAGE)
