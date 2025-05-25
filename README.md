> [!Warning]
>
> This repository is provided "as is" without any warranties or guarantees. Use it at your own risk. The authors are not responsible for any damage, loss of data, or any issues arising from the use or misuse of this code.

### Micro-Scripts

| Script | DOM Loaded? | Glance Ready? | Tested Version |
| ------ | :--------: | :--------: | :--------: |
| [custom-api Script Loader](custom-api-script-loader/) | YES | YES | v0.8.3 |
| [Swipe Left and Right](swipe-left-and-right/) | YES | NO | v0.8.3  |
| [Modal](modal/) | YES | NO | v0.8.3  |
| [Tab Notification](tab-notification/) | YES | YES | v0.8.3  |


### Limitations
Scripts that provide GUI itself like `Modal` can only be used with widgets that allows custom html like `custom-api`, `html`, `extension` and the like.

### Loading Script
Issues with loading the scripts are mostly because of the lack of [Cache Busting](https://www.keycdn.com/support/what-is-cache-busting) for JavaScript.

There are multiple methods you can load the scripts, such as:

* The loader I used to use that loads the scripts like modules and appends File Modified Data as Cache Busting was https://github.com/ralphocdol/glance-js-loader#setting-up-loader.

* Or the current one I'm using:

    ```javascript

    // Add here if the script doesn't need both DOM and Glance to be ready

    document.addEventListener('DOMContentLoaded', async () => {
        console.info("DOM is ready...");

        // Add here if the script needs the DOM to be loaded 
        // but doesn't need the Glance to be ready

        console.info("Waiting for Glance...");
        while (!document.body.classList.contains('page-columns-transitioned')) {
        await new Promise(resolve => setTimeout(resolve, 50));
        }
        console.info("Glance is ready...");

        // Add here if the script needs the Glance to be ready
    });
    ```
    in the `document` config:
    ```yaml
    document:
        head: |
            <script>
                $include: path-to-js-above/main.js
            </script>
    ```


