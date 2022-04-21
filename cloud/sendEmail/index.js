// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//引入发送邮件的类库
var nodemailer = require('nodemailer')
// 创建一个SMTP客户端配置
var config = {
  // service: 'qq',
  host: 'smtp.qq.com', //网易163邮箱 smtp.163.com
  port: 465, //网易邮箱端口 25
  auth: {
    user: '347941618@qq.com', //邮箱账号
    pass: 'utfsulgmocnpcaga' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
// 云函数入口函数
exports.main = async (event, context) => {
  let {feedbackText} = event
  let mail = {
    // 发件人
    from: 'Muse ToDo<347941618@qq.com>',
    // 主题
    subject: 'Mini program feedback',
    // 收件人
    to: 'wuzuan2022@163.com',
    // 邮件内容，text或者html格式
    text: feedbackText //可以是链接，也可以是验证码
  };

  let res = await transporter.sendMail(mail);
  return res;
}