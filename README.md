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

- `DOM Loaded` - can be checked with:
    ```js
    console.log("Waiting for DOM...");
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM is ready...");
        // Your script starts here
    });
    ```

- `Glance Ready` - can be checked with:
    ```js
    console.log("Waiting for Glance...");
    while (!document.body.classList.contains('page-columns-transitioned')) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log("Glance is ready...");
    // Your script starts here
    ```

### Loading Script
Issues with loading the scripts are mostly because of the lack of [Cache Busting](https://www.keycdn.com/support/what-is-cache-busting) for JavaScript as of v0.8.2.
1. Still waiting for https://github.com/glanceapp/glance/pull/551 as it can fix those cache issue
2. The loader I used that loads the scripts like modules and appends File Modified Data as Cache Busting: https://github.com/ralphocdol/glance-js-loader#setting-up-loader