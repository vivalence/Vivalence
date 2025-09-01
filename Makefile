# todo: implement variants
# // VIVA_SYSTEM_VARIANT="BUILD_CLIENT" # CLIENT SERVICE SUDO
.PHONY: build-root build-daemon build-web build-all dev-up prod-up clean

PROFILE ?= development
COMPOSE_FILES = -f variants/docker-compose.yml

ifeq ($(PROFILE),development)
    COMPOSE_FILES += -f variants/docker-compose.development.yml
endif
ifeq ($(PROFILE),production)
    COMPOSE_FILES += -f variants/docker-compose.production.yml
endif

build-root:
	docker build -t vivalence/viva:latest .

build-daemon:
	docker build -f system/daemon/Dockerfile -t vivalence/daemon:latest .

build-web:
	docker build -f system/clients/web/Dockerfile -t vivalence/web:latest .

build-all: build-root build-daemon build-web

dev-root: build-root
	@echo  "$(COMPOSE_FILES)"
	docker-compose $(COMPOSE_FILES) up root -d

dev-up: build-root
	docker-compose $(COMPOSE_FILES) up --build

prod-up: build-all
	docker-compose -f variants/docker-compose.yml -f variants/docker-compose.production.yml up -d

clean:
	docker-compose $(COMPOSE_FILES) down --volumes --remove-orphans
	docker system prune -f
