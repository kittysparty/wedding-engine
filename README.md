# Your Big Day — wedding engine

One hosted script that powers every Your Big Day digital wedding page.

A wedding page is a 3-line stub:

```html
<div id="ybd-app" data-event="EVENT-CODE"></div>
<script src="https://cdn.jsdelivr.net/gh/kittysparty/wedding-engine@v1/ybd-engine.js"></script>
```

All per-couple content (names, date, story, menu, seating, feature flags, theme)
lives in the platform Google Sheet, keyed by event code. Update this file once
and every wedding page updates.
