import _ from 'lodash';
import rp from 'request-promise';
import jQuery from 'jquery';
import Promise from 'bluebird';
import { env } from 'jsdom';

const fromInput = name => $ => $(`input[name="${name}"]`).val() || undefined;
const fromTextArea = name => $ => $(`textarea[name="${name}"]`).text().trim() || undefined;
const defaultValue = value => val => val || value;
const parseInt = value => _.isString(value) && Number.parseInt(value) || undefined;
const parseDate = value => _.isString(value) && Date.parse(value) || undefined;

const infoLoaders = {
  realName: fromInput('txt_realname'),
  id: fromInput('txt_girlid'),
  chineseName: fromInput('txt_cname'),
  otherName: fromInput('txt_othername'),
  englishName: fromInput('txt_englishname'),
  country: fromInput('txt_country'),
  birthPlace: fromInput('txt_district'),
  birthday: _.flow([
    fromInput('txt_birth'),
    parseDate,
  ]),
  bloodType: fromInput('txt_bloodtype'),
  height: _.flow([
    fromInput('txt_height'),
    parseInt,
  ]),
  weight: _.flow([
    fromInput('txt_weight'),
    parseInt,
  ]),
  bust: _.flow([
    fromInput('txt_chest'),
    parseInt,
  ]),
  waist: _.flow([
    fromInput('txt_waist'),
    parseInt,
  ]),
  hip: _.flow([
    fromInput('txt_hip'),
    parseInt,
  ]),
  cup: fromInput('txt_cup'),
  shoeSize: _.flow([
    fromInput('txt_footsize'),
    parseInt,
  ]),
  company: fromInput('txt_company'),
  beginTime: _.flow([
    fromInput('txt_begintime'),
    parseDate,
  ]),
  endTime: _.flow([
    fromInput('txt_endtime'),
    parseDate,
  ]),
  photoUrl: fromInput('txt_photo'),
  interest: fromInput('txt_interest'),
  description: fromTextArea('txt_info'),
  coverImageUrl: $ => $('.infoleft_imgdiv > a.imglink > img').attr('src'),
};

export class Girl {
  constructor(info) {
    this.info = info;
  }

  toJSON() {
    return _.clone(this.info);
  }

  toJSONString() {
    return JSON.stringify(this.toJSON(), (key, value) => {
      if (_.isDate(value)) {
        return value.toISOString();
      }
      return value;
    }, 2);
  }

  get bwh() {
    return _.compact([
      this.info.bust && `B${this.info.bust}`,
      this.info.waist && `W${this.info.waist}`,
      this.info.hip && `H${this.info.hip}`,
    ]).join(' ');
  }

  static load(id) {
    return rp(`http://www.zngirls.com/girl/${id}/`)
      .then(Promise.promisify(env))
      .then(jQuery)
      .then($ => new Girl(_.mapValues(infoLoaders, loader => loader($))));
  }
}
