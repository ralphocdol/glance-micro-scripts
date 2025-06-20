> [!WARNING]
>
> This repository is provided "as is" without any warranties or guarantees. Use it at your own risk. The authors are not responsible for any damage, loss of data, or any issues arising from the use or misuse of this code.

### Micro-Scripts

| Script | DOM Loaded? | Glance Ready? | Tested Version |
| ------ | :--------: | :--------: | :--------: |
| [HTML Script Loader](html-script-loader/) | YES | YES | v0.8.4 |
| [Swipe Left and Right](swipe-left-and-right/) | YES | NO | v0.8.4  |
| [Modal](modal/) | YES | NO | v0.8.4  |
| [Tab Notification](tab-notification/) | YES | YES | v0.8.4  |
| [Glimpse](glimpse/) | PARTIAL | PARTIAL | v0.8.4  |
| **<span style="color:red;">SOON!</span>** [Responsive Table](#) | YES | YES | v0.8.4 |

*PARTIAL simply means half of the script needs to be DOM Loaded and the other half is Glance Ready.*

### Limitations
Scripts that provide GUI itself like `Modal` can only be used with widgets that allows custom html like `custom-api`, `html`, `extension` and the like.

### Loading Script
Issues with loading the scripts are mostly because of the lack of [Cache Busting](https://www.keycdn.com/support/what-is-cache-busting) for JavaScript.

There are multiple methods you can load the scripts, such as:

* The loader I used to use that loads the scripts like modules and appends File Modified Data as Cache Busting was https://github.com/ralphocdol/glance-js-loader#setting-up-loader which is deprecated. 

* Or the current one I'm using:

    in the `document` config:
    ```yaml
    document:
        head: |
            <script>
                $include: path-to-js/main.js
            </script>
    ```

    inside `main.js`
    ```javascript
    // Add here if the script doesn't need both DOM and Glance to be ready

    document.addEventListener('DOMContentLoaded', async () => {
        console.info("DOM is ready...");

        // Add here if the script needs the DOM to be loaded 
        // but doesn't need the Glance to be ready
        $include: glimpse/pre-glance.js // example since 1 part of Glimpse can be loaded before Glance is ready

        console.info("Waiting for Glance...");
        while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));
        console.info("Glance is ready...");

        $include: glimpse/post-glance.js // example since 1 part of Glimpse can be loaded after Glance is ready

        // Add here if the script needs the Glance to be ready
    });
    ```

> [!NOTE]
>
> Doing it this way will make the JS file follow the Glance's configuration template for the `document` `head`. Like how the a `${LOCAL_VARIABLE}` will be treated as an environment variable and needs to be escaped with `\` and become `\${LOCAL_VARIABLE}`. See https://github.com/glanceapp/glance/blob/v0.8.3/docs/configuration.md#environment-variables.
    
