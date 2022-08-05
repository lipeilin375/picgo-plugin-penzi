// const logger = require('@varnxy/logger')
// logger.setDirectory('/Users/zhang/Work/WorkSpaces/WebWorkSpace/picgo-plugin-penzi/logs')
// let log = logger('plugin')

module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('penzi', {
      handle,
      name: '喷子图床',
      config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.penzi')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    const url = 'https://pz.al/api/upload'
    const paramName = 'image'
    const jsonPath = 'data.url'
    const customHeader = ''
    const customBody = ''
    const placeHolder = userConfig.placeHolder
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, customHeader, customBody, url, paramName, imgList[i].fileName)
        let body = await ctx.Request.request(postConfig)

        delete imgList[i].base64Image
        delete imgList[i].buffer
        if (!jsonPath) {
          imgList[i]['imgUrl'] = body
        } else {
          body = JSON.parse(body)
          let imgUrl = body
          for (let field of jsonPath.split('.')) {
            imgUrl = imgUrl[field]
          }
          if (imgUrl) {
            imgList[i]['imgUrl'] = imgUrl
          } else {
            ctx.emit('notification', {
              title: '返回解析失败',
              body: '请检查JsonPath设置'
            })
          }
        }
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: JSON.stringify(err)
      })
    }
  }

  const postOptions = (image, customHeader, customBody, url, paramName, fileName) => {
    let headers = {
      contentType: 'multipart/form-data',
      'User-Agent': 'PicGo'
    }
    if (customHeader) {
      headers = Object.assign(headers, JSON.parse(customHeader))
    }
    let formData = {}
    if (customBody) {
      formData = Object.assign(formData, JSON.parse(customBody))
    }
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    opts.formData[paramName] = {}
    opts.formData[paramName].value = image
    opts.formData[paramName].options = {
      filename: fileName
    }
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.penzi')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'placeHolder',
        type: 'input',
        default: userConfig.placeHolder || '',
        required: false,
        message: '主要为了好看。。。',
        alias: '这是一个占位符'
      }
    ]
  }
  return {
    uploader: 'penzi',
    register

  }
}
