> [!Warning]
>
> This repository is provided "as is" without any warranties or guarantees. Use it at your own risk. The authors are not responsible for any damage, loss of data, or any issues arising from the use or misuse of this code.

### Micro-Scripts

| Script | DOM Loaded? | Tested Version |
| ------ | :--------: | :--------: |
| [custom-api Script Loader](custom-api-script-loader/) | YES | v0.7.13, [dev (2d1e317)](https://github.com/glanceapp/glance/tree/2d1e317c1f9404145cf794753f93ebe38ece08de) |
| [Swipe Left and Right](swipe-left-and-right/) | NO | v0.7.13, [dev (2d1e317)](https://github.com/glanceapp/glance/tree/2d1e317c1f9404145cf794753f93ebe38ece08de)  |
| [Modal](modal/) | YES | v0.7.13, [dev (2d1e317)](https://github.com/glanceapp/glance/tree/2d1e317c1f9404145cf794753f93ebe38ece08de)  |
| [Tab Notification](tab-notification/) | YES | v0.7.13, [dev (2d1e317)](https://github.com/glanceapp/glance/tree/2d1e317c1f9404145cf794753f93ebe38ece08de)  |


### Loading Script
Issues with loading the scripts are mostly because of the lack of [Cache Busting](https://www.keycdn.com/support/what-is-cache-busting) for JavaScript as of v0.7.13.
1. Still waiting for https://github.com/glanceapp/glance/pull/551 as it can fix those cache issue
2. The loader I used that loads the scripts like modules and appends File Modified Data as Cache Busting: https://github.com/ralphocdol/glance-js-loader#setting-up-loader

Assuming #1 was PR'd then we can simply add them with minimal modification with exceptions of those script that needed the Glance to be ready by wrapping them with:
```javascript
// Tested with v0.7.13 and 2d1e317
document.addEventListener("DOMContentLoaded", (event) => {

    // This part is optional but will make sure that the glance is ready
    // Careful as this may change in the future release
    console.log("Waiting for Glance...");
    while (!document.body.classList.contains('page-columns-transitioned')) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log("Waiting for Glance...");

    // Micro-script(s) here
});
```