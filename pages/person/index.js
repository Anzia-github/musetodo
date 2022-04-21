import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

function lineInit0(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var lineChart = wx.getStorageSync('lineChart');
  chart.setOption(getLineOption(lineChart.day));
  return chart;
}

function lineInit1(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var lineChart = wx.getStorageSync('lineChart');
  chart.setOption(getLineOption(lineChart.week));
  return chart;
}

function lineInit2(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var lineChart = wx.getStorageSync('lineChart');
  chart.setOption(getLineOption(lineChart.month));
  return chart;
}

function getPieOption(option) {
  return {
    backgroundColor: "#ffffff",
    series: [{
      label: {
        normal: {
          fontSize: 14
        }
      },
      type: 'pie',
      center: ['50%', '50%'],
      radius: ['20%', '40%'],
      data: option
    }]
  };
}

function getLineOption(option) {
  console.log('option', option);
  return {
    grid: {
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      // boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      // show: false
    },
    yAxis: {
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'line'
        }
      }
      // show: false
    },
    series: [{
      type: 'line',
      smooth: true,
      data: option
    }]
  }
}

function pieInit0(canvas, width, height, dpr) {
  const pieChart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(pieChart);
  var tagChart = wx.getStorageSync('tagChart');
  pieChart.setOption(getPieOption(tagChart.day));
  return pieChart;
}

function pieInit1(canvas, width, height, dpr) {
  const pieChart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(pieChart);
  var tagChart = wx.getStorageSync('tagChart');
  pieChart.setOption(getPieOption(tagChart.week));
  return pieChart;
}

function pieInit2(canvas, width, height, dpr) {
  const pieChart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(pieChart);
  var tagChart = wx.getStorageSync('tagChart');
  pieChart.setOption(getPieOption(tagChart.month));
  return pieChart;
}

Page({
  data: {
    pie0: {
      onInit: pieInit0,
    },
    pie1: {
      onInit: pieInit1,
    },
    pie2: {
      onInit: pieInit2,
    },
    line0: {
      onInit: lineInit0
    },
    line1: {
      onInit: lineInit1
    },
    line2: {
      onInit: lineInit2
    },
    userInfo: null, // 用户信息，存图片和姓名
    totalHour: '0.00', // 总时间
    completed: 0, // 已完成计划
    pieFlag: -1, // Pie标识
    lineFlag: -1, // Line标识
    today: new Date().getMonth() + 1 + '/' + new Date().getDate() // 
  },
  onShow() { // 页面展示生命周期
    console.log('onshow');
    let user = wx.getStorageSync('user')
    if (user.length != 0) { // 需要登陆才能调用里面的方法
      this.setData({
        userInfo: user, // 从缓存中获取
        pieFlag: 0, // Pie标识
        lineFlag: 0, // Line标识
      })
      this.getTotalHour() // 获取记录总时间
      this.getCompleted() // 获取已完成的计划
    } else {
      this.setData({
        userInfo: user, // 从缓存中获取
        totalHour: '0.00',
        completed: 0,
        pieFlag: -1, // Pie标识
        lineFlag: -1, // Line标识
      })
    }
  },
  onHide() {
    this.setData({
      pieFlag: -1, // Pie标识
      lineFlag: -1, // Line标识
    })
  },
  // 这个是点击Login in触发的回调
  // 需要先判断状态，如果没有登陆就拉起授权弹窗
  showSetting() {
    console.log('showSetting');
    // 从缓存中读取
    let user = wx.getStorageSync('user')
    if (user.length == 0) { // 如果缓存中没有，则代表没有登陆
      wx.getUserProfile({ // 调起授权弹窗事件
        desc: 'Get user information.',
        success: (res) => {
          this.setData({ // 将返回的userInfo赋值
            userInfo: res.userInfo,
          })
          this.getUser() // 先去数据库查找是否有注册过
        }
      })
    } else { // 如果获得缓存，则代表已经登陆了，可以进去设置详情页面
      wx.navigateTo({
        url: '/pages/setting/index',
      })
    }
  },
  // 获得用户信息
  getUser() {
    console.log('getUser');
    wx.cloud.database().collection('user')
      .get()
      .then(res => {
        console.log('getUser success', res);
        if (res.data.length == 0) { // 数据库没有该用户，进行注册
          this.addUser()
        } else { // 数据库有该用户，将数据库返回的信息保存到本地缓存中
          wx.setStorageSync('user', res.data[0]) // 缓存用户信息
          this.getTotalHour() // 获取记录总时间
          this.getCompleted() // 获取已完成的计划
          app.getPlanList()
          app.getTagList()
          app.tagChart()
          app.timeLine()
          app.getRecordList()
          setTimeout(_ => {
            this.setData({
              pieFlag: 0, // Pie标识
              lineFlag: 0, // Line标识
            })
          }, 1000)
        }
      })
      .catch(err => {
        console.log('getUser error', err);
      })
  },
  // 添加用户信息
  addUser() {
    console.log('addUser');
    wx.cloud.database().collection('user')
      .add({
        data: {
          nickName: this.data.userInfo.nickName,
          avatarUrl: this.data.userInfo.avatarUrl,
          gender: this.data.userInfo.gender,
          createTime: new Date()
        }
      })
      .then(res => {
        console.log('addUser success', res);
        this.getUser() // 添加成功需要再调用一下getUser()，将信息保存到缓存中
      })
      .catch(err => {
        console.log('addUser error', err);
      })
    let tagList = ['Work', 'Private', 'Life', 'Leisure', 'Study', 'Sport']
    for (let i = 0; i < tagList.length; i++) {
      this.addDefaultTag(tagList[i])
    }
    let templateList = [{
        title: 'Default',
        content: ''
      },
      {
        title: 'Record',
        content: "What I did today:"
      },
    ]
    for (let i = 0; i < templateList.length; i++) {
      this.addDefaultTemplate(templateList[i].title, templateList[i].content)
    }
  },
  addDefaultTag(title) {
    console.log('addDefaultTag');
    wx.cloud.database().collection('tag')
      .add({
        data: {
          title: title,
          createTime: new Date(),
          deleteTime: new Date(),
          delete: false,
          totalTime: '0.00'
        }
      })
      .then(res => {
        console.log('add success', res)
        this.getCardList()
      })
      .catch(err => {
        console.log('add error', err)
      })
  },
  addDefaultTemplate(title, content) {
    console.log('addDefaultTemplate');
    wx.cloud.database().collection('template')
      .add({
        data: {
          title: title,
          content: content,
          createTime: new Date(),
          updateTime: new Date(),
          deleteTime: new Date(),
          delete: false
        }
      })
      .then(res => {
        console.log('add success', res)
        this.getTemplateList()
      })
      .catch(err => {
        console.log('add error', err)
      })
  },
  // 获取记录总时间
  getTotalHour() {
    console.log('getTotalHour');
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      wx.cloud.database().collection('tag')
        .get()
        .then(res => {
          console.log("get all tag success", res);
          let totalTime = 0
          for (let i = 0; i < res.data.length; i++) {
            totalTime += parseInt(res.data[i].totalTime)
          }
          totalTime = totalTime / 1000 / 60 / 60
          totalTime = Math.round(totalTime * 100) / 100
          this.setData({
            totalHour: totalTime
          })
        }).catch(err => {
          console.log("get all tag error", err);
        })
    }
  },
  // 获取已完成的计划
  getCompleted() {
    console.log('getCompleted');
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      wx.cloud.database().collection('plan')
        .where({
          finish: true
        })
        .get()
        .then(res => {
          console.log('get completed success', res);
          this.setData({
            completed: res.data.length
          })
        })
        .catch(err => {
          console.log('get completed error', err);
        })
    }
  },
  // 点击Template按钮跳转页面
  showTemplate() {
    wx.navigateTo({
      url: '/pages/textTemplate/index',
    })
  },
  // 点击Tag按钮跳转页面
  showTag() {
    wx.navigateTo({
      url: '/pages/tag/index',
    })
  },
  // 切换饼图
  piechangeDay(e) {
    let i = e.currentTarget.dataset.id
    if (i == 0) {
      this.setData({
        pieFlag: 0
      })
    } else if (i == 1) {
      this.setData({
        pieFlag: 1
      })
    } else if (i == 2) {
      this.setData({
        pieFlag: 2
      })
    }
  },
  // 切换折线图
  linechangeDay(e) {
    let i = e.currentTarget.dataset.id

    if (i == 0) {
      this.setData({
        lineFlag: 0,
      })
    } else if (i == 1) {
      this.setData({
        lineFlag: 1,
      })
    } else if (i == 2) {
      this.setData({
        lineFlag: 2,
      })
    }
  },
  // 转发分享给好友
  onShareAppMessage: function (res) {
    return {
      title: 'Muse ToDo：简约优美的计时软件',
      path: '/pages/person/index', //这里是被分享的人点击进来之后的页面
      imageUrl: '../../image/person/logo.png' //图片的路径
    }
  },
  // 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: 'Muse ToDo：简约优美的计时软件',
      query: '',
      imageUrl: '../../image/person/logo.png' //图片的路径
    }
  }
});