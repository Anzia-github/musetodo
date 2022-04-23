// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: '' // 在自己云开发里面获取
    })
  },
  globalData: {},
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
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('get tag success', res)
        wx.setStorageSync('tagList', res.data)
      })
      .catch(err => {
        console.log('get tag error', err)
      })
  },
  tagChart() {
    console.log('调用了全局函数tagChart');
    let time = []
    // 获取当天 23:59:59 的时间戳
    let now = Date.parse(new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1))
    console.log(now);
    // 分别定义每天、每周和每月的时长，单位是ms
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
        let dayMap = new Map()
        let weekMap = new Map()
        let monthMap = new Map()
        for (let i = 0; i < time.length; i++) {
          //  < 数据的日期 < 现在的日期
          if (time[i].dataTime < now && time[i].dataTime > now - day) { // day
            if (dayMap.has(time[i].tagName)) {
              dayMap.set(time[i].tagName, dayMap.get(time[i].tagName) + time[i].totalTime)
            } else {
              dayMap.set(time[i].tagName, time[i].totalTime)
            }
          }
          if (time[i].dataTime < now && time[i].dataTime > now - week) { // week
            if (weekMap.has(time[i].tagName)) {
              weekMap.set(time[i].tagName, weekMap.get(time[i].tagName) + time[i].totalTime)
            } else {
              weekMap.set(time[i].tagName, time[i].totalTime)
            }
          }
          if (time[i].dataTime < now && time[i].dataTime > now - month) { // month
            if (monthMap.has(time[i].tagName)) {
              monthMap.set(time[i].tagName, monthMap.get(time[i].tagName) + time[i].totalTime)
            } else {
              monthMap.set(time[i].tagName, time[i].totalTime)
            }
          }
        }
        dayMap.forEach((value, key) => {
          tagChart.day.push({
            value: value,
            name: key
          })
        })
        weekMap.forEach((value, key) => {
          tagChart.week.push({
            value: value,
            name: key
          })
        })
        monthMap.forEach((value, key) => {
          tagChart.month.push({
            value: value,
            name: key
          })
        })
        if (tagChart.day.length == 0) {
          tagChart.day = [{
            value: 1,
            name: 'None'
          }]
        }
        if (tagChart.week.length == 0) {
          tagChart.week = [{
            value: 1,
            name: 'None'
          }]
        }
        if (tagChart.month.length == 0) {
          tagChart.month = [{
            value: 1,
            name: 'None'
          }]
        }
        wx.setStorageSync('tagChart', tagChart)
        console.log(tagChart);
      })
      .catch(err => {})
  },
  getRecordList() {
    console.log('getRecordList');
    wx.cloud.database().collection('text')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('get success', res)
        wx.setStorageSync('recordList', res.data)
      })
      .catch(err => {
        console.log('get error', err)
      })
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
          // 通过开始时间和结束时间，算出中间时间
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
        wx.setStorageSync('lineChart', lineChart)
        console.log(lineChart);
      })
      .catch(err => {})
  },
  // 对比时间段
  compareTime(averageTime, lineChart, time) {
    let detail = Math.floor(time.totalTime / 1000 / 60 * 100) / 100
    if (averageTime > 0 && averageTime < 240) {
      lineChart[0] = detail // 00:00 - 04:00
    } else if (averageTime > 240 && averageTime < 480) {
      lineChart[1] = detail // 04:00 - 08:00
    } else if (averageTime > 480 && averageTime < 720) {
      lineChart[2] = detail // 08:00 - 12:00
    } else if (averageTime > 720 && averageTime < 960) {
      lineChart[3] = detail // 12:00 - 16:00
    } else if (averageTime > 960 && averageTime < 1200) {
      lineChart[4] = detail // 16:00 - 20:00
    } else if (averageTime > 1200 && averageTime < 1440) {
      lineChart[5] = detail // 20:00 - 24:00
    }
  }
  // ********************************************
})