#  文件上传以及大文件切片处理

###  大图上传功能

1. 传统方案： `formData的数据格式` 传给服务器；服务器接收到文件存储起来，把文件存储地址返给客户端！

```js
let formData = new FormData(); // 原生自带的构造函数
formData.append('chunk', file); // 发送文件 由input得到的文件数据
formData.append('filename', file.name) // 发送文件名

// ajax 发送请求 
let res = await $ajax({
    url: '请求接口',
    data: formData
 })
```

1. 传递给服务器文件 `base64编码格式（文件流的形式）`；服务器接受到`base64文件`并转换为图片存储，返回存储地址！

```js
let fileRead = new FileReader();
// 转为buffer格式的数据
fileRead.readAsArrayBuffer(file) // 接收到file文件转为buffer数据
// 异步函数
fileRead.onload = ev => { 
   console.log(ev.target.result)
   base64 = ev.target.result // 在这人获取到base64的文件格式
}
```

然后再`ajax`发送请求：

```js
// base64发送的格式
headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
 }
// 数据发送data信息应是 chunk=''&filename=''的形式
data = `chunk=${encodeURLComponent(base64)}&filename=${file.name}`
```

1. 把大文件切片化（5个） 运用`http`可以多个并发传递；（file是Blob类的实例！ Blob.prototype.slice可以把一个文件切片处理）
2. 同时并发五个切片上传；
3. 等5个都上传完，在向服务器发送一个合并图片的请求！

```js
// 把一个文件切成5个切片；可固定切片数量以及文件大小
      let partSize = file.size / 5; // 每个切片的大小
      let cur = 0, i = 0, partList = [];
      while (i < 5) {
        partList.push({
          chunk: file.slice(cur, cur + partSize),
          filename: `${file.name}_${i}`
        })
        cur += partList
        i++;
      }
// 并发切片请求
      partList = partList.map(item => {
        // ajax请求
        return $ajax.then(res => {
          if (res.code === 200) {
           return Promise.resolve(res)
          }
          return Promise.reject(res)
        })
      })

  // 合并请求
      await Promise.all(partList);
	let result = await $ajax({
        url: '合并请求'
    })
```



###  监听进度

1. 切片上传时，监听切片上传的数量！
2. 利用`XMLHttpRequest.upload.onprogress`方法，回调函数包含了上传进度信息！

