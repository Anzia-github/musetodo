import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({
  data: {
    popupFlag: false,
    cardList: [],
    text: '',
  },
  getCardList() {
    wx.cloud.database().collection('tag')
    .where({
      delete: false
    })
    .get()
    .then(res => {
      console.log('查询成功结果：', res.data)
      this.setData({
        cardList: res.data
      })
      wx.setStorageSync('tagList', res.data)
    })
    .catch(err => {
      console.log('查询失败结果：', err)
    })
  },
  onLoad() {
    this.getCardList()
  },
  add() {
    this.setData({
      popupFlag: true
    })
  },
  onClose() {
    this.setData({
      popupFlag: false,
      title: ''
    })
  },
  Done() {
    let text = this.data.text
    if (text.length == 0) {
      Toast('Please enter the content.')
    } else if (text.length >= 20) {
      Toast('Input requires less than 20 words.')
    } else {
      wx.cloud.database().collection('tag')
        .add({
          data: {
            title: this.data.text,
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
      this.setData({
        popupFlag: false,
        text: ''
      })
    }
  },
  delete(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    Dialog.confirm({
        title: 'Are you sure to delete?',
        message: 'Deleting tags will not affect your duration data.',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        wx.cloud.database().collection('tag')
          .doc(id)
          .update({
            data: {
              delete: true,
              deleteTime: new Date()
            }
          })
          .then(res => {
            console.log('remove success', res)
            this.getCardList()
          })
          .catch(err => {
            console.log('remove err', err)
          })
          app.getTagList()
      })
      .catch(() => {
        // on cancel
      });
  },
  inputTag(e) {}
})