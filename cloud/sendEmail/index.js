const cloud = require('wx-server-sdk') // 云函数入口文件
cloud.init()
var nodemailer = require('nodemailer') //引入发送邮件的类库
var config = { // 创建一个SMTP客户端配置
  host: 'smtp.qq.com', //网易163邮箱 smtp.163.com
  port: 465, //网易邮箱端口 25
  auth: {
    user: '347941618@qq.com', //邮箱账号
    pass: 'utfsulgmocnpcaga' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
exports.main = async (event, context) => { // 云函数入口函数
  let {feedbackText} = event
  let mail = {
    from: 'Muse ToDo<347941618@qq.com>', // 发件人
    subject: 'Mini program feedback', // 主题
    to: 'wuzuan2022@163.com', // 收件人
    text: feedbackText // 邮件内容，text或者html格式
  };
  let res = await transporter.sendMail(mail);
  return res;
}

