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
    loginFlag: false,
    userInfo: null,
    completed: 0,
    totalHour: 0,
    pieEvent: {},
    tagChart: [],
    pieFlag: 0,
    lineFlag: 0,
    today: new Date().getMonth() + 1 + '/' + new Date().getDate()
  },
  totalHour() {
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
  },
  completed() {
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
  },
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
  onShow() {
    let tagChart = wx.getStorageSync('tagChart')
    // this.getPieOption(tagChart.day)
    console.log(this.data.lineFlag == 0);
    this.setData({
      tagChart: wx.getStorageSync('tagChart'),
      userInfo: wx.getStorageSync('user'),
    })
    this.completed()
    this.totalHour()
  },
  showTemplate() {
    wx.navigateTo({
      url: '/pages/textTemplate/index',
    })
  },
  showTag() {
    wx.navigateTo({
      url: '/pages/tag/index',
    })
  },
  showSetting() {
    let user = wx.getStorageSync('user')
    console.log(user)
    if (user.length == 0) {
      wx.getUserProfile({
        desc: 'Get user information.',
        success: (res) => {
          this.setData({ // 将返回的userInfo赋值
            userInfo: res.userInfo,
          })
          this.getUser(res) // 先去数据库查找是否有注册过
          this.getCompletedPlan()
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/setting/index',
      })
    }
  },
  addUser() {
    wx.cloud.database().collection('user')
      .add({
        data: {
          nickName: this.data.userInfo.nickName,
          avatarUrl: this.data.userInfo.avatarUrl,
          gender: this.data.userInfo.gender
        }
      })
      .then(res => {
        console.log('addUser success', res);
        this.getUser()
      })
      .catch(err => {
        console.log('addUser error', err);
      })
  },
  getUser() {
    wx.cloud.database().collection('user')
      .get()
      .then(res => {
        console.log('getUser success', res);
        if (res.data.length == 0) { // 数据库没有该用户，进行注册
          console.log('注册');
          this.addUser(res)
        } else {
          wx.setStorageSync('user', res.data[0]) // 数据库有该用户，将数据库返回的信息保存到本地缓存中
        }
      })
      .catch(err => {
        console.log('getUser error', err);
      })
  }
});