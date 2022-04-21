import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({
  data: {
    flag: 0,
    show: false,
    showTextArea: false,
    dialogFlag: false,
    cardFlag: false,
    textFlag: true,
    time: {
      localtime: null,
      date: null
    },
    templateName: '',
    content: '',
    columns: [],
    title: '',
    template: [],
    templateId: '',
    recordId: '',
    cardList: []
  },
  getRecordList() {
    wx.cloud.database().collection('text')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('get success', res)
        this.setData({
          cardList: res.data
        })
      })
      .catch(err => {
        console.log('get error', err)
      })
  },
  getTemplateList() {
    wx.cloud.database().collection('template')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('template get success', res.data)
        let columns = res.data.map((value, index) => {
          return value.title
        })
        this.setData({
          template: res.data,
          columns: columns
        })
      })
      .catch(err => {
        console.log('get error', err)
      })
  },
  onShow() {
    this.getTemplateList()
    this.getRecordList()
  },
  popupCancel() {
    if (this.data.title == 'Filter text types') {
      this.data.columns.shift()
      this.setData({
        colomus: this.data.columns
      })
    }
    this.setData({
      show: false,
    })
  },
  popupConfirm() {
    let picker = this.selectComponent('#picker')
    let index = picker.getIndexes()[0]
    console.log('下标', index)
    if (this.data.title == 'Filter text types') { // 这个是确认筛选
      this.filter(index)
      this.data.columns.shift()
      this.setData({
        show: false,
        colomus: this.data.columns
      })
    } else { // 这个是新建文本
      this.textTemplate(index)
    }
  },
  filter(index) {
    if (index - 1 >= 0) {
      wx.cloud.database().collection('text')
        .where({
          templateName: this.data.columns[index],
          delete: false
        })
        .get()
        .then(res => {
          console.log('filter success', res)
          this.setData({
            cardList: res.data
          })
        })
        .catch(err => {
          console.log('filter error', err)
        })
    } else {
      this.getRecordList()
    }
  },
  showCard(e) {
    let detail = e.currentTarget.dataset.item
    this.setData({
      recordId: detail._id,
      cardFlag: true,
      time: {
        localtime: detail.updateFormatTime,
        date: detail.date,
      },
      templateName: detail.templateName,
      content: detail.content
    })
  },
  formatDay(myDate) {
    let formatDay = {
      year: myDate.getFullYear(),
      month: myDate.getMonth() < 10 ? '0' + (myDate.getMonth() + 1) : myDate.getMonth() + 1,
      date: myDate.getDate() < 10 ? '0' + myDate.getDate() : myDate.getDate(),
      hour: myDate.getHours() < 10 ? '0' + myDate.getHours() : myDate.getHours(),
      min: myDate.getMinutes() < 10 ? '0' + myDate.getMinutes() : myDate.getMinutes(),
      sec: myDate.getSeconds() < 10 ? '0' + myDate.getSeconds() : myDate.getSeconds(),
      Day: new Array("Sun", "Mon", "Tues", "Wed", "Thur", "Fir", "Sat")
    }
    let getDay = {
      localtime: formatDay.year + '-' + formatDay.month + '-' + formatDay.date + ' ' + formatDay.hour + ':' + formatDay.min + ':' + formatDay.sec,
      date: formatDay.Day[myDate.getDay()]
    }
    return getDay
  },
  textTemplate(index) {
    let templateDetail = this.data.template[index]
    let templateName = templateDetail.title
    let content = templateDetail.content
    let myDate = new Date()
    let getDay = this.formatDay(myDate)
    this.setData({
      time: {
        localtime: getDay.localtime,
        date: getDay.date
      },
      templateId: templateDetail._id,
      show: false,
      showTextArea: true,
      flag: 0,
      templateName: templateName,
      content: content
    })
  },
  popupChange(e) {
    // const {
    //   value,
    //   index
    // } = e.detail;
    // Toast(`当前值：${value}, 当前索引：${index}`);
  },
  showSetting() {
    this.data.columns.unshift('All')
    this.setData({
      show: true,
      title: 'Filter text types',
      columns: this.data.columns
    })
    console.log(this.data.columns)
  },
  showTemplate() {
    console.log(this.data.columns)
    this.setData({
      show: true,
      title: 'Select text template',
      flag: 1,
      columns: this.data.columns
    })
  },
  onClose() {
    this.setData({
      showTextArea: false,
      cardFlag: false,
      textFlag: true
    })
  },
  Done() {
    let getDate = this.formatDay(new Date())
    wx.cloud.database().collection('text')
      .add({
        data: {
          templateId: this.data.templateId,
          templateName: this.data.templateName,
          content: this.data.content,
          createTime: new Date(),
          createFormatTime: getDate.localtime,
          updateTime: new Date(),
          updateFormatTime: getDate.localtime,
          delete: false,
          deleteTime: new Date(),
          date: getDate.date
        }
      })
      .then(res => {
        console.log('add success', res)
        this.getRecordList()
      })
      .catch(err => {
        console.log('add error', err)
      })
    this.setData({
      showTextArea: false
    })
  },
  Edit() {
    this.setData({
      textFlag: false
    })
  },
  Update() {
    Dialog.alert({
        message: 'Confirm update?',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      }).then(() => {
        console.log('updating')
        let getDate = this.formatDay(new Date())
        wx.cloud.database().collection('text')
          .doc(this.data.recordId)
          .update({
            data: {
              updateTime: new Date(),
              updateFormatTime: getDate.localtime,
              date: getDate.date,
              content: this.data.content
            }
          })
          .then(res => {
            console.log('add success', res)
            this.getRecordList()
          })
          .catch(err => {
            console.log('add error', err)
          })
        this.setData({
          textFlag: true,
          cardFlag: false
        })
      })
      .catch(err => {
        console.log(err)
      })
  },
  delete(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    Dialog.alert({
        message: 'Confirm delete?',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        console.log('deleting')
        wx.cloud.database().collection('text')
          .doc(id)
          .update({
            data: {
              delete: true,
              deleteTime: new Date()
            }
          })
          .then(res => {
            console.log('delete success', res)
            this.getRecordList()
          })
          .catch(err => {
            console.log('delete error', err)
          })
      })
      .catch(() => {})
  }
})