const cloud = require('wx-server-sdk') // 云函数入口文件
cloud.init()
var nodemailer = require('nodemailer') //引入发送邮件的类库
var config = { // 创建一个SMTP客户端配置
  host: 'smtp.qq.com', //网易163邮箱 smtp.163.com
  port: 465, //网易邮箱端口 25
  auth: {
    user: 'xxxxx@qq.com', //邮箱账号
    pass: '' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
exports.main = async (event, context) => { // 云函数入口函数
  let {feedbackText} = event
  let mail = {
    from: 'Muse ToDo<xxxxx@qq.com>', // 发件人 <>里面的邮件要和上面auth.user一致
    subject: 'Mini program feedback', // 主题
    to: '', // 收件人 设置不同的邮箱，不能自己发自己收
    text: feedbackText // 邮件内容，text或者html格式
  };
  let res = await transporter.sendMail(mail);
  return res;
}

