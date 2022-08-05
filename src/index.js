module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('penzi', {
      handle,
      name: 'penzi',
      config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picgoBed.penzi')
    if (!userConfig) {
      throw new Error('penzi config is empty')
    }
    const url = userConfig.url
    const token = userConfig.token
    const jsonPath = 'data.url'
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, token, url, imgList[i].filename)
        let body = await ctx.request(postConfig)

        delete imgList[i].buffer
        delete imgList[i].base64Image

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
            body: 'upload failed'
          })
        }
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: JSON.stringify(err)
      })
    }
  }
  const postOptions = (image, token, url, filename) => {
    let headers = {
      ContentType: 'multipart/form-data',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
    }
    let formData = {}
    formData = Object.assign(formData, JSON.parse(image))
    const opts = {
      method: 'POST',
      url: url,
      headers: token,
      formData: formData
    }
    opts.formData['image'] = {}
    opts.formData['image'].value = image
    opts.formData['image'].options = {
      filename: fileName,
    }
    return opts
  }
  const config = ctx => {
    let userConfig = ctx.getConfig('picgoBed.penzi')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'url',
        type: 'input',
        default: userConfig.url,
        required: true,
        message: '请输入喷子图床POST地址',
        alias: 'POST地址'
      },
      {
        name: 'token',
        type: 'input',
        default: userConfig.token || '',
        required: false,
        message: '请输入喷子图床Token',
        alias: 'Token'
      }
    ]
  }
  return {
    uploader: 'penzi',
    register
  }
}
