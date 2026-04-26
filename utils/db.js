/**
 * 云数据库工具层
 * 使用微信云开发云数据库（免费额度）
 * 同时提供本地存储降级方案（离线缓存）
 */

let db = null
let isCloudReady = false

/**
 * 初始化云开发
 * 需要在 app.vue 的 onLaunch 中调用一次
 */
export function initCloud(envId) {
  try {
    wx.cloud.init({
      env: envId,
      traceUser: false
    })
    db = wx.cloud.database()
    isCloudReady = true
    console.log('[DB] 云数据库初始化成功')
  } catch (e) {
    console.warn('[DB] 云数据库初始化失败，将使用本地存储', e)
    isCloudReady = false
  }
}

/**
 * 获取集合引用
 */
export function getCollection(name) {
  if (!isCloudReady || !db) return null
  return db.collection(name)
}

// ===================== 通用 CRUD =====================

/**
 * 添加文档
 * @param {string} collName 集合名
 * @param {object} data 文档数据
 */
export async function addDoc(collName, data) {
  const payload = {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  if (isCloudReady) {
    try {
      const res = await db.collection(collName).add({ data: payload })
      // 同步本地缓存
      _syncLocalAdd(collName, { _id: res._id, ...payload })
      return { success: true, _id: res._id }
    } catch (e) {
      console.error('[DB] addDoc 失败，降级本地存储', e)
    }
  }
  // 降级：本地存储
  return _localAdd(collName, payload)
}

/**
 * 查询全部文档（带简单过滤）
 * @param {string} collName 集合名
 * @param {object} where 查询条件（可选）
 */
export async function getDocs(collName, where = {}) {
  if (isCloudReady) {
    try {
      let query = db.collection(collName)
      if (Object.keys(where).length > 0) {
        query = query.where(where)
      }
      const res = await query.orderBy('createdAt', 'desc').limit(100).get()
      // 写入本地缓存
      uni.setStorageSync(`cache_${collName}`, JSON.stringify(res.data))
      return { success: true, data: res.data }
    } catch (e) {
      console.error('[DB] getDocs 失败，读取本地缓存', e)
    }
  }
  // 降级：本地存储
  return _localGetAll(collName)
}

/**
 * 更新文档
 * @param {string} collName 集合名
 * @param {string} id 文档 _id
 * @param {object} data 更新字段
 */
export async function updateDoc(collName, id, data) {
  const payload = { ...data, updatedAt: Date.now() }
  if (isCloudReady) {
    try {
      await db.collection(collName).doc(id).update({ data: payload })
      _syncLocalUpdate(collName, id, payload)
      return { success: true }
    } catch (e) {
      console.error('[DB] updateDoc 失败，降级本地存储', e)
    }
  }
  return _localUpdate(collName, id, payload)
}

/**
 * 删除文档
 * @param {string} collName 集合名
 * @param {string} id 文档 _id
 */
export async function deleteDoc(collName, id) {
  if (isCloudReady) {
    try {
      await db.collection(collName).doc(id).remove()
      _syncLocalDelete(collName, id)
      return { success: true }
    } catch (e) {
      console.error('[DB] deleteDoc 失败，降级本地存储', e)
    }
  }
  return _localDelete(collName, id)
}

// ===================== 本地存储实现（降级 & 缓存） =====================

function _getLocalList(collName) {
  try {
    const raw = uni.getStorageSync(`cache_${collName}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function _saveLocalList(collName, list) {
  uni.setStorageSync(`cache_${collName}`, JSON.stringify(list))
}

function _genId() {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
}

function _localAdd(collName, data) {
  const list = _getLocalList(collName)
  const item = { _id: _genId(), ...data }
  list.unshift(item)
  _saveLocalList(collName, list)
  return { success: true, _id: item._id }
}

function _localGetAll(collName) {
  const data = _getLocalList(collName)
  return { success: true, data }
}

function _localUpdate(collName, id, data) {
  const list = _getLocalList(collName)
  const idx = list.findIndex(i => i._id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data }
    _saveLocalList(collName, list)
  }
  return { success: true }
}

function _localDelete(collName, id) {
  const list = _getLocalList(collName)
  const filtered = list.filter(i => i._id !== id)
  _saveLocalList(collName, filtered)
  return { success: true }
}

function _syncLocalAdd(collName, item) {
  const list = _getLocalList(collName)
  list.unshift(item)
  _saveLocalList(collName, list)
}

function _syncLocalUpdate(collName, id, data) {
  const list = _getLocalList(collName)
  const idx = list.findIndex(i => i._id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data }
    _saveLocalList(collName, list)
  }
}

function _syncLocalDelete(collName, id) {
  const list = _getLocalList(collName)
  _saveLocalList(collName, list.filter(i => i._id !== id))
}

// ===================== 集合名常量 =====================
export const COLLECTIONS = {
  TODO: 'todos',
  EVENT: 'events',
  ITEM: 'items'  // 物品管理
}
