> [!Warning]
>
> This repository is provided "as is" without any warranties or guarantees. Use it at your own risk. The authors are not responsible for any damage, loss of data, or any issues arising from the use or misuse of this code.

### Micro-Scripts

| Script | DOM Loaded? | Tested Version |
| ------ | :--------: | :--------: |
| [custom-api Script Loader](custom-api-script-loader/) | YES | v0.7.9, [dev (7f0e9b3)](https://github.com/glanceapp/glance/tree/7f0e9b328918fbbd4c60107201ee04fc21efdbe1) |
| [Swipe Left and Right](swipe-left-and-right/) | YES | v0.7.9, [dev (7f0e9b3)](https://github.com/glanceapp/glance/tree/7f0e9b328918fbbd4c60107201ee04fc21efdbe1)  |
| [Modal](modal/) | YES | v0.7.9, [dev (7f0e9b3)](https://github.com/glanceapp/glance/tree/7f0e9b328918fbbd4c60107201ee04fc21efdbe1)  |
| [Tab Notification](tab-notification/) | YES | v0.7.9, [dev (7f0e9b3)](https://github.com/glanceapp/glance/tree/7f0e9b328918fbbd4c60107201ee04fc21efdbe1)  |


### Loading Script
Issues with loading the scripts are mostly because of the lack of [Cache Busting](https://www.keycdn.com/support/what-is-cache-busting) for JavaScript as of v0.7.9.
1. Still waiting for https://github.com/glanceapp/glance/pull/551 as it can those cache issue
2. The loader I used that loads the scripts like modules and appends File Modified Data as Cache Busting: https://github.com/ralphocdol/glance-js-loader#setting-up-loader

Assuming #1 was PR'd then we can simply add them with minimal modification with exceptions of those script that needed the Glance to be ready by wrapping them with:
```javascript
document.addEventListener("DOMContentLoaded", (event) => {

    // This part is optional but will make sure that the glance is ready
    // Careful as this may change in the future release
    // tested with v0.7.9 and 7f0e9b3
    console.log("Waiting for Glance...");
    while (!document.body.classList.contains('page-columns-transitioned')) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log("Waiting for Glance...");

    // Micro-script here
});
```