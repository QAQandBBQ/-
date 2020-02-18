// 封装ajax请求
function $ajax(options) {
  // 合并默认请求参数
  options = Object.assign({
    url: '', // 请求路径
    method: 'post', // 默认为post请求
    data: null, // 请求参数
    headers: {}, // 请求头信息
    process: Function.prototype // 上传进度的回调，默认指向Function的prototype，即为空；
 }, options)

  //  基于promise返回
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest;
    // 上传进度
    xhr.upload.onprogress = options.process;
    // 建立联系
    xhr.open(options.method.toUpperCase(), options.url, true);
    // 配置header信息 =》 用于base64传递文件时；
    Object.keys(options.headers).forEach(key => {
      xhr.setRequestHeader(key, options.headers[key]);
    });
    // 发送请求
    xhr.send(options.data)
    // 监听状态的改变
    xhr.onreadystatechange = function() {
      // 4 或 200表示发送响应
      if(xhr.readyState === 4) {
        // 表示服务请接收到请求并返回数据
        if (/^(2|3)\d{2}/.test(xhr.status)) {
          resolve(JSON.parse(xhr.responseText))
          return
        }
        reject(xhr)
      }
    }
  })
}

// 格式化数据
function onFormatName(name) {
  // 记录最后一个‘.’的位置
  let flagIndex = name.lastIndexOf('.');
  
  // hash值由文件名前缀的md5转义值凭接上时间戳；
  let hash = `${md5(name.slice(0, flagIndex))}${new Date().getTime()}`,
    suffix = name.slice(flagIndex + 1);

  // 返回对应的数据
  return {
    hash,
    suffix,
    hashName: `${hash}.${suffix}`
  }
}