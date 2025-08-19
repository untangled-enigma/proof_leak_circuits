help: 
			@echo "Available Commands:"
			@echo "compile - Compiles and generates circuits"

compile: 
			@bash scripts/compile.sh

test-js:
			cd js && npm run test