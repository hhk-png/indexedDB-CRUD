const indexedDB: IDBFactory = 
    window.indexedDB || 
    (window as any).mozIndexedDB ||
    (window as any).webkitIndexedDB ||
    (window as any).msIndexedDB

// 打开数据库
export function openDB(dbName: string, version: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        // const indexedDB: IDBFactory = 
        //     window.indexedDB || 
        //     (window as any).mozIndexedDB ||
        //     (window as any).webkitIndexedDB ||
        //     (window as any).msIndexedDB

        let db: IDBDatabase;
        const request = indexedDB.open(dbName, version)
        // 数据库打开成功的回调
        request.onsuccess =  (event) => {
            db = (event.target as any).result;
            console.log('数据库打开成功')
            resolve(db)
        }
        // 数据库打开失败的回调
        request.onerror = () => {
            console.log('数据库打开出错')
            throw new Error('数据库打开出错')
        }
        // 数据库更新时的回调
        request.onupgradeneeded = (event) => {
            console.log('onupgradeneeded')
            db = (event.target as any).result
            // 创建存储库
            const objectStore = db.createObjectStore('signalChat', {
                // 主键
                keyPath: 'sequenceId'
            })
            // 总共三个键，包括一个主键
            objectStore.createIndex('sequenceId', 'sequenceId', { unique: false })
            objectStore.createIndex('link', 'link', { unique: false })
            objectStore.createIndex('message', 'message', { unique: false })
        }
    })
}

interface Data {
    sequenceId: number,
    link: string,
    message: string
}

// 插入数据
export function addData(db: IDBDatabase, storeName: string, data: Data) {
    const request = db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .add(data)

    request.onsuccess = (event) => {
        console.log('数据写入成功')
    }
    request.onerror = (event) => {
        console.log('数据写入失败')
        throw new Error('数据写入失败')
    }
}

// 通过主键读取数据
export function getDataByKey(db: IDBDatabase, storeName: string, key: number) {
    return new Promise((resolve, reject) => {
        const request = db
            .transaction([storeName], 'readwrite')
            .objectStore(storeName)
            .get(key)
        request.onerror = () => {
            console.log('事务失败')
            throw new Error('事务失败')
        }
        request.onsuccess = (event) => {
            console.log('主键查询结果', request.result)
            resolve(request.result)
        }
    })
}

// 通过游标查询数据
export function cursorGetData(db: IDBDatabase, storeName: string) {
    const list: Data[] = []
    const request: IDBRequest<IDBCursorWithValue | null> = db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .openCursor()
    // 游标开启成功
    request.onsuccess = (e) => {
        const cursor = (e.target as any).result
        if (cursor) {
            list.push(cursor.value)
            // 便利了存储对象中的所有内容
            cursor.continue()
        } else {
            console.log('游标读取的数据', list)
        }
    }
}

// 读取第一个
export function getDataByIndex(db: IDBDatabase, storeName: string, indexName: string, indexValue: number | string) {
    return new Promise((resolve) => {
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
        const request = store.index(indexName).get(indexValue)
        request.onerror = () => {
            console.log('事务失败')
            throw new Error('事务失败')
        }
        request.onsuccess = (event) => {
            const result = (event.target as any).result
            console.log(result)
            resolve(result)
        }
    })
}

// 通过索引和游标查询记录
// 读取全部满足要求的数据
export function cursorGetDataByIndex(db: IDBDatabase, storeName: string, indexName: string, indexValue: string | number) {
    const list: Data[] = []
    const store = db.transaction(storeName, "readwrite").objectStore(storeName)
    const request = store
        .index(indexName)
        .openCursor(IDBKeyRange.only(indexValue))
    request.onsuccess = (e) => {
        const cursor = (e.target as any).result
        if (cursor) {
            list.push(cursor.value)
            cursor.continue()
        } else {
            console.log('游标查询结果', list)
        }
    } 
    request.onerror = () => {
        console.log('error')
    }
}

// 通过索引和游标分页查询
export function cursorGetDataByIndexAndPage(
    db: IDBDatabase,
    storeName: string,
    indexName: string,
    indexValue: string | number,
    page: number, // 页码
    pageSize: number // 业内条数
) {
    const list: Data[] = []
    let counter: number = 0
    let advanced: boolean = true
    const request = db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName)
        .index(indexName)
        .openCursor(IDBKeyRange.only(indexValue))
    request.onsuccess = (e) => {
        let cursor = (e.target as any).result
        if (page > 1 && advanced) {
            advanced = false
            cursor.advance((page - 1) * pageSize)
            return
        }
        if (cursor) {
            list.push(cursor.value)
            counter++
            if (counter < pageSize) {
                cursor.continue()
            } else {
                cursor = null
                console.log("分页查询结果", list);
            }
        } else {
            console.log("分页查询结果", list);
        }
    }
    request.onerror = (e) => {}
}

// 更新数据
export function updateDB(db: IDBDatabase, storeName: string, data: Data) {
    const request = db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .put(data)
    
    request.onsuccess = () => {
        console.log("数据更新成功");
    }

    request.onerror = () => {
        console.log("数据更新失败");
    }
}

// 通过主键删除数据
export function deleteDBByKeyPath(db: IDBDatabase, storeName: string, keyPath: string) {
    const request = db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .delete(keyPath)
    request.onsuccess = () => {
        console.log("数据删除成功");
    };
    
    request.onerror = () => {
        console.log("数据删除失败");
    };
}

// 通过索引和游标删除指定数据
export function cursorDelete(db: IDBDatabase, storeName: string, indexName: string, indexValue: string | number) {
    const request = db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .index(indexName)
        .openCursor(IDBKeyRange.only(indexValue))
    request.onsuccess = (e) => {
        let cursor = (e.target as any).result
        if (cursor) {
            const deleteRequest = cursor.delete()
            deleteRequest.onerror = function () {
                console.log("游标删除该记录失败");
            };
            deleteRequest.onsuccess = function () {
                console.log("游标删除该记录成功");
            };
            cursor.continue()
        }
    }
    request.onerror = (e) => {}
}

// 关闭数据库
export function closeDB(db: IDBDatabase) {
    db.close()
    console.log('数据库已关闭')
}

// 删除数据库
export function deleteDB(dbName: string) {
    console.log(dbName)
    let deleteRequest = indexedDB.deleteDatabase(dbName)
    deleteRequest.onerror = function (event) {
        console.log("删除失败");
    };
    deleteRequest.onsuccess = function (event) {
        console.log("删除成功");
    };
}
