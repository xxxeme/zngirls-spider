import path from 'path';
import Promise from 'bluebird';
import mkdirp from 'mkdirp';
import fs from 'fs';
import { download } from './downloader';

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
    girl.toJSON(),
    girl.toJSONString(),
    ensureDir(dir),
  ]).spread((info, infoStr) => Promise.all([
    download({
      url: info.coverImageUrl,
      encoding: null,
      path: path.join(dir, '#cover#.jpg'),
    }),
    writeFileAsync(path.join(dir, 'info.json'), infoStr),
  ]));
};

export function dumpAlbum(album) {
  const dir = path.join(root, 'girls', String(album.girlId), String(album.id));
  Promise.all([
    album.toJSON(),
    album.toJSONString(),
    ensureDir(dir),
  ]).spread((info, infoStr) => Promise.all([
    download({
      url: info.coverImageUrl,
      encoding: null,
      path: path.join(dir, '#cover#.jpg'),
    }),
    writeFileAsync(path.join(dir, 'info.json'), infoStr),
  ]));
  Promise.all([
    album.toJSON(),
    ensureDir(dir)
  ]).spread(info => Promise.map(info.images, ({
    local,
    remote
  }) => download({
    url: remote,
    encoding: null,
    path: path.join(dir, local),
  })));
}
