import _ from 'lodash';
import Promise from 'bluebird';
import mkdirp from 'mkdirp';
import fs from 'fs';
import rp from 'request-promise';

const {
  lstatAsync,
  writeFileAsync,
} = Promise.promisifyAll(fs);
const mkdirpAsync = Promise.promisify(mkdirp);

let config = {
  concurrency: 10,
  onStart: _.noop,
  onComplete: _.noop,
  onError: _.noop,
};
let count = 0;

export function setup({
  concurrency,
  onStart,
  onComplete,
  onError,
}) {
  if (concurrency > 0 && _.isInteger(concurrency)) {
    config.concurrency = concurrency;
  }
  if (_.isFunction(onStart)) {
    config.onStart = onStart;
  }
  if (_.isFunction(onComplete)) {
    config.onComplete = onComplete;
  }
  if (_.isFunction(onError)) {
    config.onError = onError;
  }
}

const taskQueue = [];

function execute() {
  while (taskQueue.length > 0 && config.concurrency > count) {
    const { options, resolve, reject } = taskQueue.shift();
    const url = options.url;
    const path = options.path || null;

    config.onStart(options);
    rp(_.omit(options, 'path'))
      .then(data => {
        if (path) {
          return writeFileAsync(path, data);
        }
        return data;
      })
      .tap(() => config.onComplete(options))
      .then(resolve)
      .catch(err => {
        config.onError(_.assignIn({ err }, options));
        reject(err);
      })
      .finally(() => {
        count --;
        setImmediate(execute);
      });
    count ++;
  }
}

export function download(options) {
  const p$download = new Promise((resolve, reject) => {
    taskQueue.push({
      options: _.isString(options) ? { url: options } : options,
      resolve,
      reject
    });
  });
  execute();
  return p$download;
}
