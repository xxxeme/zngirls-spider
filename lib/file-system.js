import path from 'path';
import Promise from 'bluebird';
import mkdirp from 'mkdirp';
import fs from 'fs';
import rp from 'request-promise';

const {
  lstatAsync,
  writeFileAsync,
} = Promise.promisifyAll(fs);
const mkdirpAsync = Promise.promisify(mkdirp);

const root = process.env.ZNGIRLS_ROOT || path.join(process.env.HOME, '.zngirls');

function ensureDir(path) {
  return lstatAsync(path).then(stat => {
    if (!stat.isDirectory()) {
      throw new Error('Cannot make directory over a file');
    }
  }, () => mkdirpAsync(path));
}

export function dumpGirl(girl) {
  const dir = path.join(root, 'girls', String(girl.id));
  Promise.all([
    girl.p$info,
    girl.toJSONString(),
    ensureDir(dir)
  ]).spread((info, infoStr) => Promise.all([
    rp({
      url: info.coverImageUrl,
      encoding: null,
    }),
    writeFileAsync(path.join(dir, 'info.json'), infoStr),
  ])).spread(data => writeFileAsync(path.join(dir, 'cover.jpg'), data, 'binary'));
};
