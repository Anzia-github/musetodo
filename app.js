// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: 'time-manage-8gxwgld9070ec562'
    })
    this.getPlanList()
    this.getTagList()
    this.tagChart()
    this.timeLine()
  },
  globalData: {
    userInfo: null,
    planList: [],
    tagChart: {},
    lineChart: {},
  },
  // ********************************************
  // 从plan表get数据
  getPlanList() {
    wx.cloud.database().collection('plan')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('getPlan success', res);
        this.globalData.planList = res.data
        wx.setStorageSync('planList', res.data)
      })
      .catch(err => {
        console.log('getPlan error', err);
      })
  },
  // 从tag表中get数据
  getTagList() {
    wx.cloud.database().collection('tag')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('get tag success', res)
        this.globalData.tagList = res.data
        wx.setStorageSync('tagList', res.data)
      })
      .catch(err => {
        console.log('get tag error', err)
      })
  },
  tagChart() {
    console.log('调用了全局函数tagChart');
    let time = []
    let now = Date.parse(new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1))
    console.log(now);
    let day = 86400000
    let week = 604800000
    let month = 2592000000
    let tagChart = {
      day: [],
      week: [],
      month: []
    }
    wx.cloud.database().collection('time')
      .get()
      .then(res => {
        time = res.data
        console.log(time);
        for (let i = 0; i < time.length; i++) {
          if (time[i].dataTime < now && time[i].dataTime > now - day) { // day
            tagChart.day.push({
              value: time[i].totalTime,
              name: time[i].tagName
            })
          }
          if (time[i].dataTime < now && time[i].dataTime > now - week) { // week
            tagChart.week.push({
              value: time[i].totalTime,
              name: time[i].tagName
            })
          }
          if (time[i].dataTime < now && time[i].dataTime > now - month) { // month
            tagChart.month.push({
              value: time[i].totalTime,
              name: time[i].tagName
            })
          }
        }
        this.globalData.tagChart = tagChart
        console.log('globalData 的 tagChart', this.globalData.tagChart);
        wx.setStorageSync('tagChart', tagChart)
        console.log(tagChart);
      })
      .catch(err => {})
  },
  timeLine() {
    console.log('调用了全局函数timeLine');
    let time = []
    let now = Date.parse(new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1))
    let day = 86400000
    let week = 604800000
    let month = 2592000000
    let lineChart = {
      day: [0, 0, 0, 0, 0, 0, 0],
      week: [0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0, 0, 0, 0]
    }
    wx.cloud.database().collection('time')
      .get()
      .then(res => {
        time = res.data
        console.log(time);
        for (let i = 0; i < time.length; i++) {
          let averageHour = (new Date(time[i].startTime).getHours() + new Date(time[i].endTime).getHours()) / 2
          let averageMin = (new Date(time[i].startTime).getMinutes() + new Date(time[i].endTime).getMinutes()) / 2
          let averageTime = averageMin + 60 * averageHour
          if (time[i].dataTime < now && time[i].dataTime > now - day) { // day
            this.compareTime(averageTime, lineChart.day, time[i])
          }
          if (time[i].dataTime < now && time[i].dataTime > now - week) { // week
            this.compareTime(averageTime, lineChart.week, time[i])
          }
          if (time[i].dataTime < now && time[i].dataTime > now - month) { // month
            this.compareTime(averageTime, lineChart.month, time[i])
          }
        }
        this.globalData.lineChart = lineChart
        console.log('globalData 的 lineChart', this.globalData.lineChart);
        wx.setStorageSync('lineChart', lineChart)
        console.log(lineChart);
      })
      .catch(err => {})
  },
  compareTime(averageTime, lineChart, time) {
    let detail = Math.floor(time.totalTime / 1000 / 60 * 100) / 100
    if (averageTime > 0 && averageTime < 240) {
      lineChart[0] = detail
    } else if (averageTime > 240 && averageTime < 480) {
      lineChart[1] = detail
    } else if (averageTime > 480 && averageTime < 720) {
      lineChart[2] = detail
    } else if (averageTime > 720 && averageTime < 960) {
      lineChart[3] = detail
    } else if (averageTime > 960 && averageTime < 1200) {
      lineChart[4] = detail
    } else if (averageTime > 1200 && averageTime < 1440) {
      lineChart[5] = detail
    }
  }
  // ********************************************
})