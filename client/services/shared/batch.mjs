export default (entities, chunkSize, createPromiseFromEntity) => {
    if (!entities) {
        return Promise.reject(new Error('entities is required'));
    }

    if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
        return Promise.reject(new Error('chunkSize is required and must be positive number'));
    }

    if (!createPromiseFromEntity || typeof createPromiseFromEntity !== "function") {
        return Promise.reject(new Error('createPromiseFromEntity is required and must be a function'));
    }

    const batches = [];
    let i = 0;
    while (i < entities.length) {
        batches.push(entities.slice(i, i + chunkSize));
        i += chunkSize;
    }

    return batches.reduce((res, batch) => res.then(r =>
        Promise.all(batch.map(createPromiseFromEntity)).then(batchResult => r.concat(batchResult))
    ), Promise.resolve([]));
}