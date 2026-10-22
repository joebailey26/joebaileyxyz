const database = new Promise((resolve, reject) => {
  const request = indexedDB.open('joebailey-cms-recovery', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('checkpoints');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export async function recovery(action, value) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('checkpoints', action === 'get' ? 'readonly' : 'readwrite');
    const store = transaction.objectStore('checkpoints');
    const request = action === 'get' ? store.get('pending') : action === 'put' ? store.put(value, 'pending') : store.delete('pending');
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Local recovery storage failed'));
  });
}
