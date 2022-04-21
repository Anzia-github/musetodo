import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

Page({
  data: {
    rateFlag: false,
    rateValue: 0,
    feedFlag: false,
    aboutFlag: false,
    aboutText: 'Muse ToDo is a simple, scientific and effective time management application. You can use it to schedule, time and record your experience. The data chart can feed back its own learning data in real time.',
    feedbackText: '',
  },
  onChange(e) {
    this.setData({
      rateValue: e.detail,
    });
  },
  showRate() {
    this.setData({
      rateFlag: true
    })
  },
  sendEmail(text) {
    wx.cloud.callFunction({
      name: 'sendEmail',
      data: {
        feedbackText: text
      },
      success(res) {
        console.log('send success', res);
      },
      fail(err) {
        console.log('send error', err);
      }
    })
  },
  onClose() {
    if (this.data.rateFlag && this.data.rateValue > 0) {
      let text = '小程序评分：' + this.data.rateValue
      this.sendEmail(text)
    }
    this.setData({
      rateFlag: false,
      feedFlag: false,
      aboutFlag: false,
      rateValue: 0
    })
  },
  showFeedback() {
    this.setData({
      feedFlag: true
    })
  },
  Done() {
    if (this.data.feedbackText == 0) {
      Toast('Please enter text.')
    } else {
      this.sendEmail(this.data.feedbackText)
      this.setData({
        feedFlag: false
      })
    }
  },
  showAbout() {
    this.setData({
      aboutFlag: true
    })
  },
  logout() {
    wx.removeStorageSync('user')
    wx.navigateBack()
  }
})