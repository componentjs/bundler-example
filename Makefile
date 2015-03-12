
META= $(wildcard component.json lib/*/*.json)
SRC= $(wildcard lib/*/*.js)
CSS= $(wildcard lib/*/*.css)


standalone: components $(SRC) $(CSS)
	@node builder -s

bundles: components $(SRC) $(CSS)
	@node builder

components: $(META)
	@component install

clean:
	rm -rf components build

.PHONY: clean
