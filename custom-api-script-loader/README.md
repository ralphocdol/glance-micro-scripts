[⇐ Micro-script list](../#micro-scripts)

Adding `<script></script>` in the custom API template does not work as of now, as the script will not load. Additionally, there is currently no way to automatically refresh widgets independently, with this, you can now load a script.

> [!Caution]
>
> Using API queries like `fetch` with API keys within the script is possible but it WILL expose them in the browser.

# Usage
The template should have the `attribute type="custom-api-scripts"` and the function `scriptLoad()`

Add a script like so below your `custom-api`'s template config
```javascript
<script type="custom-api-scripts">
    const scriptLoad = () => {  // this is required
        // your script should be in here
    }         
</script>
```

### Basic example
```yml
- type: custom-api
  url: https://domain.com/api
  headers:
      Accept: application/json
  template: |
    <script type="custom-api-scripts">
        const scriptLoad = () => {
            const updateClock = () => {
            const now = new Date();
            document.getElementById('clock').textContent = now.toLocaleTimeString();
            };

            updateClock();
            setInterval(updateClock, 1000);
        }
    </script>
    <div id="clock"></div>
```

### Example with API query
```yml
- type: custom-api
  cache: 6h
  css-class: custom-widget-test # as your main class element to make sure you don't update anything else
  template: |
    <script type="custom-api-scripts">
    const scriptLoad = () => {
        setInterval(async () => {
            const mainElement = document.querySelector('.custom-widget-test');
            if (mainElement && mainElement.length === 0) return;
            const targetElement = mainElement.querySelector('.target-class');
            try {
                const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random');
                const data = await response.json();
                targetElement.querySelector('.custom-text').innerText = data.text;
            } catch (error) {
                console.error({ from: 'custom-widget-test.yml', error });
            }
        }, 300000); // every 5mins, change depending on the API's rate limit
    }
    </script>
    <div class="target-class">
        <p class="size-h4 color-paragraph custom-text">{{ .JSON.String "text" }}</p>
    </div>
```