[<= Micro-script list](../#micro-scripts)

No native modal in Glance at the moment though there was a request for it: https://github.com/glanceapp/glance/discussions/190

Until then, this will have to do.

![preview1](preview1.png)
![preview2](preview2.png)

# How to
```html
<div custom-modal>
  <!-- <div modal-header>
    Header, can be omitted
  </div> -->
  <div modal-body>
    Body
  </div>
  <!-- <div modal-footer>
    Footer, can be omitted
  </div> -->
  Click me! <!-- Single html tag or plain text as the button -->
</div>
```
## Modal Attributes
| Attribute | Required | Default | Options | Description |
| --------- | -------- | ------- | ------- | ----------- |
| custom-modal | Yes | - | - | Will be used as a modal container |
| dismiss-on-outside-click | No | false | true, false | will allow the modal to be closed when clicked anywhere outside the modal |
| modal-no-background | No | false | true, false | will remove the background of the modal |
| width | No | wide | small, medium, wide, full | Sets the width of the modal. |
| height | No | tall | short, medium, tall, full | Sets the "maximum" height of the modal, will automatically use the height depending on the content. |
| fillHeight | No | false | true, false | Fills the set height regardless of the content |