import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const app = getApp()

Page({
  data: {
    time: 25 * 60 * 1000,
    timeData: {
      minutes: 25,
      seconds: 0
    },
    relaxFlag: false,
    lists: [],
    sortList: [],
    show: false,
    start: true,
    pause: false,
    continue: false,
    end: false,
    columns: [],
    startTime: 0,
    endTime: 0,
    tempTime: 0,
    pauseTime: 0,
    totalTime: 0
  },
  onShow() {
    this.sortPlanList()
    this.sortList()
    this.keepScreenOn()
  },
  // 屏幕常亮
  keepScreenOn() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
      fail() { //如果失败 再进行调用
        wx.setKeepScreenOn({
          keepScreenOn: true
        });
      }
    });
  },
  sortPlanList() {
    let lists = {
      "I & U": [],
      "I & N'U": [],
      "N'I & U": [],
      "N'I & N'U": []
    }
    let planList = wx.getStorageSync('planList')
    for (let i = 0; i < planList.length; i++) {
      switch (planList[i].urgency) {
        case 0:
          lists["I & U"].push(planList[i].title);
          break;
        case 1:
          lists["I & N'U"].push(planList[i].title);
          break;
        case 2:
          lists["N'I & U"].push(planList[i].title);
          break;
        case 3:
          lists["N'I & N'U"].push(planList[i].title);
          break;
      }
    }
    console.log(lists);
    let columns = [{
        values: Object.keys(lists),
        className: 'column1',
      },
      {
        values: lists['I & U'],
        className: 'column2',
        defaultIndex: 0,
      }
    ]
    this.setData({
      lists: lists,
      columns: columns
    })
  },
  sortList() {
    let sortList = {
      "I & U": [],
      "I & N'U": [],
      "N'I & U": [],
      "N'I & N'U": []
    }
    let planList = wx.getStorageSync('planList')
    for (let i = 0; i < planList.length; i++) {
      switch (planList[i].urgency) {
        case 0:
          sortList["I & U"].push(planList[i]);
          break;
        case 1:
          sortList["I & N'U"].push(planList[i]);
          break;
        case 2:
          sortList["N'I & U"].push(planList[i]);
          break;
        case 3:
          sortList["N'I & N'U"].push(planList[i]);
          break;
      }
    }
    console.log(sortList);
    this.setData({
      sortList: sortList
    })
  },
  timeChange(e) {
    // if (e.detail.seconds < 10) {
    //   this.setData({
    //     timeData: e.detail,
    //     timeData: {
    //       seconds: '0' + e.detail.seconds
    //     }
    //   });
    // }
    this.setData({
      timeData: e.detail
    })
  },
  timeon() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      this.setData({
        show: true
      })
    } else {
      Dialog.confirm({
          title: 'Need to login in before using.',
          message: 'Press forward button to jump to the login page.',
          confirmButtonText: 'Forward',
          cancelButtonText: 'Cancel'
        })
        .then(() => {
          wx.switchTab({
            url: '/pages/person/index',
          })()
        })
        .catch(() => {

        })
    }
  },
  startConfirm(e) {
    let index = e.detail.index
    let value = e.detail.value
    let timingPlan = this.data.sortList[value[0]][index[1]]
    console.log(timingPlan);
    if (timingPlan) {
      wx.setStorageSync('timingPlan', timingPlan)
      let start = new Date()
      let startTime = Date.parse(start)
      this.setData({
        startTime: startTime,
        start: false,
        pause: true,
        show: false,
        relaxFlag: false
      })
      const countDown = this.selectComponent('.control-count-down');
      countDown.start();
    } else {
      Dialog.alert({
          message: 'There is no task to start timing.',
        })
        .then(() => {})
      this.setData({
        show: false
      })
    }
  },
  pause() {
    this.setData({
      pause: false,
      continue: true,
      end: true
    })
    let tempTime = Date.parse(new Date)
    this.setData({
      tempTime: tempTime
    })
    const countDown = this.selectComponent('.control-count-down');
    countDown.pause();
  },
  continue () {
    this.setData({
      pause: true,
      continue: false,
      end: false
    })
    let on = Date.parse(new Date())
    let pauseTime = on - this.data.tempTime
    this.setData({
      pauseTime: this.data.pauseTime + pauseTime
    })
    console.log(this.data.pauseTime);
    const countDown = this.selectComponent('.control-count-down');
    countDown.start();
  },
  end() {
    Dialog.alert({
        message: 'End this timer?',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      }).then(() => {
        let endTime = Date.parse(new Date())
        let pauseTime = endTime - this.data.tempTime
        let totalTime = endTime - pauseTime - this.data.pauseTime - this.data.startTime
        this.setData({
          start: true,
          relaxFlag: false,
          continue: false,
          end: false,
          timeData: {
            minutes: 25,
            seconds: 0,
            time: 25 * 60 * 1000
          },
          endTime: endTime,
          totalTime: totalTime,
        })
        console.log(totalTime);
        this.addTime()
        this.addTagTime()
        let min = Math.floor((totalTime / 1000 / 60) << 0)
        let sec = Math.floor((totalTime / 1000) % 60)
        Notify({
          type: 'success',
          message: `Focus on ${min < 10 ? '0' + min : min}:${sec < 10 ? '0'+sec : sec}`,
          duration: 3000,
          selector: '#van-notify',
        });
      })
      .catch(err => {
        // on cancel
        console.log(err);
      });
    console.log('end')
  },
  addTime() {
    let timingPlan = wx.getStorageSync('timingPlan')
    wx.cloud.database().collection('time')
      .add({
        data: {
          dataTime: Date.parse(new Date()),
          startTime: Date.parse(new Date(this.data.startTime)),
          endTime: Date.parse(new Date(this.data.endTime)),
          totalTime: this.data.totalTime,
          tagId: timingPlan.tagId,
          tagName: timingPlan.tagName,
        }
      })
      .then(res => {
        console.log('add success', res);
        app.tagChart()
        app.timeLine()
      })
      .catch(err => {
        console.log('add error', err);
      })
  },
  addTagTime() {
    let timingPlan = wx.getStorageSync('timingPlan')
    wx.cloud.database().collection('tag')
      .doc(timingPlan.tagId)
      .update({
        data: {
          totalTime: this.data.totalTime
        }
      })
      .then(res => {
        console.log('add tag time success', res);
      })
      .catch(err => {
        console.log('add tag time error', err);
      })
  },
  finished() {
    const countDown = this.selectComponent('.control-count-down');
    let relaxFlag = this.data.relaxFlag
    countDown.pause();
    let message = ''
    if (!relaxFlag) {
      message = '专注结束，休息中'
      this.setData({
        relaxFlag: true,
        time: 5 * 60 * 1000
      })
    } else {
      message = '休息结束，开始专注'
      this.setData({
        relaxFlag: false,
        time: 25 * 60 * 1000
      })
    }
    Toast({
      position: 'top',
      message: message
    })
    countDown.start();
    console.log('finish');
  },
  onChange(event) {
    const {
      picker,
      value,
      index
    } = event.detail;
    picker.setColumnValues(1, this.data.lists[value[0]]);
  },
  onClose() {
    this.setData({
      show: false
    })
  },
  startCancel() {
    this.setData({
      show: false,
      start: true,
      continue: false
    })
  },
  onTabItemTap(item) {
    console.log(item)
  },
  onHide() {
    if (!this.data.start) {
      this.pause()
    }
  },
  // 转发分享给好友
  onShareAppMessage: function (res) {
    return {
      title: 'Muse ToDo：简约优美的计时软件',
      path: '/pages/time/index', //这里是被分享的人点击进来之后的页面
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
})