import Dialog from "../../miniprogram_npm/@vant/weapp/dialog/dialog";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";

let app = getApp()

Page({
  data: {
    show: false,
    localTime: '',
    urgency: '',
    tag: '',
    tagName: '',
    tagId: '',
    pickerShow: false,
    columns: [],
    tagcolumns: [],
    pickerTitle: '',
    title: '',
    remarks: '',
    planList: [],
    updateId: '',
    create: '',
  },
  // 生命周期
  onLoad() {
    this.getPlanList()
  },
  onShow() {
    this.setData({
      planList: wx.getStorageSync('planList'),
      tagList: wx.getStorageSync('tagList')
    })
  },
  // ********************************
  // 从plan表get数据
  getPlanList() {
    wx.cloud.database().collection('plan')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('getPlan success', res);
        this.setData({
          planList: res.data
        })
        getApp().globalData.planList = this.data.planList
        wx.setStorageSync('planList', res.data)
      })
      .catch(err => {
        console.log('getPlan error', err);
      })
  },
  // 从plan表add数据
  addPlan() {
    let getDate = new Date()
    wx.cloud.database().collection('plan')
      .add({
        data: {
          title: this.data.title,
          remarks: this.data.remarks,
          createTime: this.data.create,
          createFormatTime: this.data.localTime,
          updateTime: this.data.create,
          updateFormatTime: this.data.localTime,
          delete: false,
          finish: false,
          deleteTime: getDate,
          tagName: this.data.tagName,
          tagId: this.data.tagId,
          urgency: this.data.urgency
        }
      })
      .then(res => {
        console.log('addPlan success', res);
        this.getPlanList()
      })
      .catch(err => {
        console.log('addPlan error', err)
      })
  },
  // 从plan表update delete数据
  deleteDetail(item) {
    wx.cloud.database().collection('plan')
      .doc(item._id)
      .update({
        data: {
          delete: true,
          deleteTime: new Date()
        }
      })
      .then(res => {
        console.log('delete success', res);
        this.getPlanList()
      })
      .catch(err => {
        console.log('delete error', err);
      })
  },
  // 从plan表update finish数据
  finish(e) {
    let item = e.currentTarget.dataset.item
    wx.cloud.database().collection('plan')
      .doc(item._id)
      .update({
        data: {
          finish: !item.finish
        }
      })
      .then(res => {
        console.log('check success', res);
        this.getPlanList()
      })
      .catch(err => {
        console.log('check error', err);
      })
  },
  // 从plan表中更新计划
  updatePlan(id) {
    let getDate = new Date()
    let time = this.formatDay(getDate).localtime
    wx.cloud.database().collection('plan')
      .doc(id)
      .update({
        data: {
          title: this.data.title,
          remarks: this.data.remarks,
          updateTime: getDate,
          updateFormatTime: time,
          tagName: this.data.tagName,
          tagId: this.data.tagId,
          urgency: this.data.urgency
        }
      })
      .then(res => {
        console.log('updatePlan success', res);
        app.getPlanList()
      })
      .catch(err => {
        console.log('updatePlan error', err)
      })
  },
  // ********************************
  // --------------------------------
  onListChange(e) {

  },
  // 格式化时间
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
  // 点击添加按钮触发的事件
  add() {
    let getDate = new Date()
    let time = this.formatDay(getDate).localtime
    this.setData({
      create: getDate,
      localTime: time,
      show: true
    })
  },
  // 关闭按钮触发的事件
  onClose() {
    this.setData({
      show: false,
      title: '',
      remarks: '',
      urgency: '',
      tagName: '',
      tagId: '',
      updateId: '',
    })
  },
  // 点击完成按钮触发的事件
  Done() {
    if (this.data.title.length == 0) {
      Toast('Title required.')
    } else if (this.data.urgency.length == 0) {
      Toast('Degree required.')
    } else if (this.data.tagName.length == 0) {
      Toast('Tag required.')
    } else if (this.data.updateId.length == 0) {
      this.addPlan()
      this.onClose()
    } else {
      this.updatePlan(this.data.updateId)
      this.onClose()
    }
  },
  // 选择紧急程度
  urgencySelect() {
    this.setData({
      pickerShow: true,
      pickerTitle: 'Degree Classification',
      columns: ['I & U', "I & N'U", "N'I & U", "N'I & N'U"]
    })
  },
  // 选择标签
  tagSelect() {
    // 标签从数据库中获取，分两种情况
    let tempcColumns = this.data.tagList.map(value => {
      return value.title
    })
    this.setData({
      pickerShow: true,
      pickerTitle: 'Tag Classification',
      columns: tempcColumns,
    })
  },

  textChange() {
    this.setData({
      pickerShow: true
    })
  },
  onChange() {

  },
  onCancel() {
    this.setData({
      pickerShow: false
    })
  },
  onConfirm() {
    let picker = this.selectComponent('#picker')
    let index = picker.getIndexes()[0]
    console.log(index)
    if (this.data.pickerTitle == 'Degree Classification') {
      this.setData({
        urgency: index
      })
    } else {
      this.setData({
        tagName: this.data.columns[index],
        tagId: this.data.tagList[index]._id
      })
    }
    this.setData({
      pickerShow: false
    })
  },
  // 点击删除图标按钮触发的事件
  delete(e) {
    let item = e.currentTarget.dataset.item
    if (!item.finish) {
      Dialog.alert({
        message: "This plan isn't finish. \n Are you sure to delete?",
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      }).then(() => {
        this.deleteDetail(item)
        this.getPlanList()
      }).catch(() => {})
    } else {
      this.deleteDetail(item)
      this.getPlanList()
    }
  },

  detail(e) {
    let item = e.currentTarget.dataset.item
    console.log(item);
    this.setData({
      show: true,
      title: item.title,
      localTime: item.updateFormatTime,
      urgency: item.urgency,
      tagName: item.tagName,
      remarks: item.remarks,
      updateId: item._id
    })
  }
  // --------------------------------
})