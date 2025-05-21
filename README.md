> [!Warning]
>
> This repository is provided "as is" without any warranties or guarantees. Use it at your own risk. The authors are not responsible for any damage, loss of data, or any issues arising from the use or misuse of this code.

### Micro-Scripts

| Script | DOM Loaded? | Glance Ready? | Tested Version |
| ------ | :--------: | :--------: | :--------: |
| [custom-api Script Loader](custom-api-script-loader/) | YES | YES | v0.8.2 |
| [Swipe Left and Right](swipe-left-and-right/) | YES | NO | v0.8.2  |
| [Modal](modal/) | YES | NO | v0.8.2  |
| [Tab Notification](tab-notification/) | YES | YES | v0.8.2  |

### Loading Script
Issues with loading the scripts are mostly because of the lack of [Cache Busting](https://www.keycdn.com/support/what-is-cache-busting) for JavaScript.

The loader I use to use that loads the scripts like modules and appends File Modified Data as Cache Busting: https://github.com/ralphocdol/glance-js-loader#setting-up-loader.

You can load the scripts as such:

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