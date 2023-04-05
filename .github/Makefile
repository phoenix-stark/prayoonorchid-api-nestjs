SHELL=/bin/bash
SERVICE_NAME := $(shell git ls-remote --get-url | xargs basename -s .git)

.PHONY: setup-new-service
setup-new-service:
	@echo "-------------------------"
	@echo "------ Templating -------"
	@echo "-------------------------"
	cp -r templates/deployments ../deployments
	@echo "-------------------------"
	@echo "----- Config Naming -----"
	@echo "-------------------------"
	LC_ALL=C find ./workflows -type f -exec sed -i '' -e 's/CHANGE_ME/$(SERVICE_NAME)/g' {} \;
	LC_ALL=C find ../deployments -type f -exec sed -i '' -e 's/CHANGE_ME/$(SERVICE_NAME)/g' {} \;
