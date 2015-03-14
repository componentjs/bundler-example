
META= $(wildcard component.json lib/*/*.json)
SRC= $(wildcard lib/*/*.js)
CSS= $(wildcard lib/*/*.css)


bundles: components $(SRC) $(CSS)
	@node builder

standalone: components $(SRC) $(CSS)
	@node builder -s

components: $(META)
	@component install

clean:
	rm -rf components build

.PHONY: clean
